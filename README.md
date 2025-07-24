# 🔐 Secure Chat Backend

A secure, encrypted chat backend built with Node.js and Express.js that ensures private, authenticated, and tamper-proof communication between users.

## 🚀 Features

- ✅ User authentication & authorization
- 🔒 End-to-end encryption
- 📜 Message signing & verification
- 🛡️ Replay attack prevention
- 🔍 Identity verification
- 🗃️ Audit logging (optional)
- 🔐 Forward secrecy (optional)

## 🏗️ Tech Stack

- **Node.js** with **Express.js**
- **Socket.IO** for real-time messaging
- **JWT** for authentication
- **Crypto** for signing & encryption
- **MongoDB** (or any DB) for persistence

## 📦 Installation

```bash
git clone git@github.com:<your-username>/secure-chat-backend.git
cd secure-chat-backend
npm install
```

## 🔧 Configuration

Create a `.env` file and set the following:

```env
PORT=3000
JWT_SECRET=your_secret
MONGO_URI=your_mongodb_uri
PRIVATE_KEY_PATH=certs/your_private_key.pem
PUBLIC_KEY_PATH=certs/your_public_key.pem
```

## 🧪 Run the Server

```bash
npm run dev
```

> Server runs on `http://localhost:3000`

## 🔁 API Overview

| Endpoint            | Method | Description             |
|---------------------|--------|-------------------------|
| `/api/auth/register` | POST   | Register a new user     |
| `/api/auth/login`    | POST   | Authenticate a user     |
| `/api/messages/send` | POST   | Send signed/encrypted message |
| `/api/messages/history` | GET | Get chat history        |

## 🔐 Security Protocol

1. 🔏 **Each user has a public/private key pair**
2. 📩 Messages are **encrypted with the recipient’s public key**
3. ✍️ Messages are **signed with sender’s private key**
4. ✅ Recipients **verify signature** and **decrypt content**



