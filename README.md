# 🚀 AI Data Cleaner & Prediction Web App

A full-stack machine learning web application that allows users to upload datasets, automatically clean data, train models, and generate predictions in real-time.

---

## 🌐 Live Demo

👉 https://ai-data-cleaner-seven.vercel.app

---

## 🧠 Features

* 📂 Upload CSV dataset
* 🧹 Automatic data cleaning (missing values, preprocessing)
* 🤖 Train ML model
* 📊 Generate predictions
* ⬇️ Download cleaned dataset
* ⚡ Fast API responses
* 🌍 Fully deployed (Frontend + Backend)

---

## 🏗️ Tech Stack

### 🔹 Frontend

* React.js (Vite)
* Axios
* CSS

### 🔹 Backend

* FastAPI
* Scikit-learn
* Pandas
* NumPy

### 🔹 Deployment

* Frontend: Vercel
* Backend: Render
* Version Control: Git & GitHub

---

## 📁 Project Structure

```
AI-Data-Project/
│
├── backend/
│   ├── main.py
│   ├── model.pkl
│   ├── cleaned.csv
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
```

---

## ⚙️ Installation (Local Setup)

### 1️⃣ Clone repo

```
git clone https://github.com/yashworkchauhan-ctrl/ai-data-cleaner.git
cd ai-data-cleaner
```

### 2️⃣ Backend setup

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3️⃣ Frontend setup

```
cd frontend
npm install
npm run dev
```

---

## 🔌 API Endpoints

| Method | Endpoint  | Description      |
| ------ | --------- | ---------------- |
| POST   | /upload   | Upload dataset   |
| GET    | /download | Download cleaned |
| GET    | /train    | Train model      |
| POST   | /predict  | Get predictions  |

---

## 📸 Screenshots

> Add your UI screenshots here (optional)

---

## 🎯 Use Case

This project helps:

* Data analysts automate cleaning
* Beginners understand ML pipelines
* Companies preprocess data quickly

---

## 🚀 Future Improvements

* Add authentication
* Improve UI/UX
* Add more ML models
* Deploy with Docker

---

## 👨‍💻 Author

**Yash Chauhan**

* GitHub: https://github.com/yashworkchauhan-ctrl

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and share it 🚀
