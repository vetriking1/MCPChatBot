from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.chat_models import init_chat_model
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langchain_core.messages.ai import AIMessage
from langchain_core.messages.human import HumanMessage
from langchain_mcp_adapters.tools import load_mcp_tools
from mcp import ClientSession
import ollama
from fastapi.middleware.cors import CORSMiddleware
from mcp.client.streamable_http import streamablehttp_client
import json
import aiosqlite

def read_config()-> dict:
    with open("./server_config.json", "r") as js:
        mcp_config = json.load(js)
        return mcp_config
    
def save_config(config:dict)-> None:
    with open("./server_config.json", "w") as js:
        json.dump(config, js, indent=4)

class UserPrompt(BaseModel):
    user_prompt: str
    model_name:str
    chat_name:str


class MCPServerInfo(BaseModel):
    server_name : str
    url:str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],         # ["GET", "POST", etc.] if you want to restrict
    allow_headers=["*"],
)

model_name = "qwen3:1.7b"
# Initialize model and agent once
llm = init_chat_model(model_name, model_provider="ollama")


@app.get("/")
def home():
    return {"Home": "Welcome"}

@app.get("/tools")
async def check_tools():
    client = MultiServerMCPClient(read_config())
    tools = await client.get_tools()
    tool_list = [{"tool_name":tool.model_dump().get("name"),"description":tool.model_dump().get("description")} for tool in tools]  
    return {"all_tools": tool_list}

@app.post("/add_mcp")
def add_mcp_server(mcp_server_info:MCPServerInfo):
    config = read_config()
    config[mcp_server_info.server_name] = {
        "url":mcp_server_info.url,
        "transport": "streamable_http"
    }
    save_config(config)
    return {"res":f"The {mcp_server_info} is added"}
@app.post("/remove_mcp{server_name}")
def remove_mcp_server(server_name:str):
    config = read_config()
    config.pop(server_name, None) 
    save_config(config)
    return {"res":f"The {server_name} is deleted"}

@app.get("/server_names")
def get_mcp_server_names():
    data = read_config()
    return {"mcpserver_names":list(data.keys())}

@app.get("/model_list")
def model_list():
    return {"model_list":[model.get("model") for model in ollama.list().get("models")]}

@app.get("/tools/{server_name}")
async def get_server_tools(server_name:str):
    
    server_data = read_config()
    async with streamablehttp_client(server_data[server_name]['url']) as (read,write,_):
        async with ClientSession(read, write) as session:
            
            await session.initialize()
            
            tools = await load_mcp_tools(session)
            
            tool_list = [{"tool_name":tool.model_dump().get("name"),"description":tool.model_dump().get("description")} for tool in tools]  

            return {"tools": tool_list}
        

@app.post("/generate")
async def llm_generate(user_input: UserPrompt):
    global model_name, llm
    async with aiosqlite.connect("agent_memory.db") as conn:
        if model_name != user_input.model_name:
            llm = init_chat_model(user_input.model_name, model_provider="ollama")
            model_name = user_input.model_name
        memory = AsyncSqliteSaver(conn)
        client = MultiServerMCPClient(read_config())
        user_prompt = user_input.user_prompt
        tools = await client.get_tools()
        agent = create_react_agent(model=llm, tools=tools,checkpointer=memory)
        thread_id = user_input.chat_name
        config = {"configurable": {"thread_id": thread_id}}
        result = await agent.ainvoke({"messages": [("user", user_prompt)]},config=config)
        return {"result": f"result added to chat history"}
    
@app.get("/threadid")
async def get_id():
    conn = await aiosqlite.connect("./agent_memory.db")
    cursor = await conn.execute("SELECT DISTINCT thread_id FROM checkpoints")
    rows = await cursor.fetchall()
    await conn.close()

    # flatten results (fetchall gives list of tuples)
    thread_ids = [row[0] for row in rows]

    return {"thread_ids": thread_ids}

@app.get("/messages/{thread_id}")
async def get_msg(thread_id:str):
    async with AsyncSqliteSaver.from_conn_string("./agent_memory.db") as agent_memory:
        config = {"configurable": {"thread_id": thread_id}}
        checkpoint = await agent_memory.aget(config)
        
        h_msg = []
        ai_msg = []
        tool_msg = []   
        
        messages = checkpoint.get("channel_values").get("messages")
        
        for i in range(len(messages)):
            if type(messages[i]) == AIMessage:
                ai_msg.append(messages[i].content)
            elif type(messages[i]) == HumanMessage:
                h_msg.append(messages[i].content)
            else:
                tool_msg.append(messages[i].content)
        return {"AI":ai_msg,"Human":h_msg,"Tool":tool_msg}
            

if __name__ == "__main__":
    uvicorn.run("main:app", port=3000, reload=True)
