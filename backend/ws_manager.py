from typing import Dict, List

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, conversation_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(conversation_id, []).append(websocket)
        print(f"Connected to conversation {conversation_id}")

    def disconnect(self, conversation_id: int, websocket: WebSocket):
        if conversation_id in self.active_connections:
            self.active_connections[conversation_id].remove(websocket)

            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]

    async def notify_done(self, conversation_id: int):
        sockets = self.active_connections.get(conversation_id, [])
        for ws in sockets:
            await ws.send_json(
                {"type": "conversation_done", "conversation_id": conversation_id}
            )
