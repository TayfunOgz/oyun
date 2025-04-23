from flask import Flask, jsonify, request
from flask_socketio import SocketIO
import sqlite3

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

DB_NAME = "scores.db" 

def create_database():
    connection = sqlite3.connect(DB_NAME)
    cursor = connection.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_name TEXT NOT NULL UNIQUE,
            score INTEGER NOT NULL
        )
    """)
    connection.commit()
    connection.close()

def get_scores_from_db(limit: int = 10):
    try:
        with sqlite3.connect(DB_NAME) as connection:
            cursor = connection.cursor()
            cursor.execute(
                "SELECT player_name, score FROM scores ORDER BY score DESC LIMIT ?",
                (limit,)
            )
            results = cursor.fetchall()
            return [{"player_name": row[0], "score": row[1]} for row in results]
    except sqlite3.Error as e:
        print(f"Veritabanı hatası: {e}")
        return []

@app.route("/add_score", methods=["POST"])
def add_score():
    data = request.json
    player_name = data.get("player_name")
    score = data.get("score")

    print(f"Gelen veri: player_name={player_name}, score={score}")

    if not player_name or not isinstance(score, int):
        print("Hata: Geçersiz veri")
        return jsonify({"error": "Geçersiz veri: player_name veya score eksik/yanlış."}), 400
    if len(player_name) > 50 or not player_name.isalnum():
        print("Hata: Geçersiz oyuncu adı")
        return jsonify({"error": "Geçersiz oyuncu adı: Maksimum 50 karakter, sadece harf ve rakam."}), 400
    if score < 0:
        print("Hata: Skor negatif")
        return jsonify({"error": "Skor negatif olamaz."}), 400

    try:
        with sqlite3.connect(DB_NAME) as connection:
            cursor = connection.cursor()
            cursor.execute("""
                INSERT INTO scores (player_name, score)
                VALUES (?, ?)
                ON CONFLICT(player_name) DO UPDATE SET score=excluded.score
            """, (player_name, score))
            connection.commit()
            print(f"Skor kaydedildi: {player_name} - {score}")
    except sqlite3.Error as e:
        print(f"Veritabanı hatası: {str(e)}")
        return jsonify({"error": f"Veritabanı hatası: {str(e)}"}), 500

    return jsonify({"message": "Skor kaydedildi!"}), 200

@app.route("/get_scores", methods=["GET"])
def get_scores():
    scores = get_scores_from_db(limit=100)
    return jsonify(scores)

if __name__ == "__main__":
    create_database()
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)

