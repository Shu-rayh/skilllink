from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os
import datetime
from bson.objectid import ObjectId

load_dotenv()

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.skilllink
users_collection = db.users
trades_collection = db.trades  # new collection for trades

@app.route("/")
def home():
    return jsonify({"message": "SkillLink backend is running"}), 200

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password required"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    user_doc = {
        "name": name,
        "email": email,
        "password": hashed_pw,
        "created_at": datetime.datetime.utcnow()
    }
    users_collection.insert_one(user_doc)

    return jsonify({"message": "User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = users_collection.find_one({"email": email})
    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({"message": "Login successful", "name": user["name"], "email": user["email"]})


### Skill routes ###

# Add skill user offers
@app.route("/skills/offer", methods=["POST"])
def add_skill_offer():
    data = request.get_json()
    email = data.get("email")
    skill = data.get("skill")

    if not email or not skill:
        return jsonify({"error": "Email and skill required"}), 400

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    users_collection.update_one(
        {"email": email},
        {"$addToSet": {"skillsOffered": skill}}  # add skill only if not already present
    )
    return jsonify({"message": "Skill added to offers"}), 200

# Add skill user needs
@app.route("/skills/need", methods=["POST"])
def add_skill_need():
    data = request.get_json()
    email = data.get("email")
    skill = data.get("skill")

    if not email or not skill:
        return jsonify({"error": "Email and skill required"}), 400

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    users_collection.update_one(
        {"email": email},
        {"$addToSet": {"skillsNeeded": skill}}  # add skill only if not already present
    )
    return jsonify({"message": "Skill added to needs"}), 200

### Users ###
@app.route("/users", methods=["GET"])
def list_users():
    users_cursor = users_collection.find({}, {"_id": 0, "password": 0})
    users = list(users_cursor)
    return jsonify(users), 200

### Trade routes ###

@app.route("/trades/request", methods=["POST"])
def send_trade_request():
    data = request.get_json()
    from_email = data.get("fromUserEmail")
    to_email = data.get("toUserEmail")
    offered_skill = data.get("offeredSkill")
    requested_skill = data.get("requestedSkill")

    # Basic validation
    if not all([from_email, to_email, offered_skill, requested_skill]):
        return jsonify({"error": "All fields are required"}), 400

    # Optional: Check users exist
    if not users_collection.find_one({"email": from_email}):
        return jsonify({"error": "Sender user not found"}), 404
    if not users_collection.find_one({"email": to_email}):
        return jsonify({"error": "Receiver user not found"}), 404

    trade_doc = {
        "fromUserEmail": from_email,
        "toUserEmail": to_email,
        "offeredSkill": offered_skill,
        "requestedSkill": requested_skill,
        "status": "pending",
        "createdAt": datetime.datetime.utcnow()
    }

    res = trades_collection.insert_one(trade_doc)
    return jsonify({"message": "Trade request sent", "tradeId": str(res.inserted_id)}), 201

@app.route("/trades/<email>", methods=["GET"])
def get_trades(email):
    trades = list(trades_collection.find(
        {"$or": [{"fromUserEmail": email}, {"toUserEmail": email}]}
    ))
    for trade in trades:
        trade["_id"] = str(trade["_id"])  # convert ObjectId to string
        trade["createdAt"] = trade["createdAt"].isoformat() if "createdAt" in trade else None
    return jsonify(trades), 200

# New route: Update trade status
@app.route("/trades/<trade_id>/status", methods=["PUT"])
def update_trade_status(trade_id):
    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ["accepted", "rejected"]:
        return jsonify({"error": "Invalid status"}), 400

    result = trades_collection.update_one(
        {"_id": ObjectId(trade_id)},
        {"$set": {"status": new_status}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Trade not found"}), 404

    return jsonify({"message": f"Trade status updated to {new_status}"}), 200



### End
if __name__ == "__main__":
    app.run(debug=True)
