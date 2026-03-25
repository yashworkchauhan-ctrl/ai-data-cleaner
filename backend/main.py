from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import pandas as pd
import os
import numpy as np
import logging
import joblib

from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier

app = FastAPI()

logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

global_df = None


# =========================
# QUALITY
# =========================
def compute_quality(df):
    total = df.size if df.size > 0 else 1
    missing = df.isna().sum().sum()
    duplicates = df.duplicated().sum()

    score = 100 - (
        (missing / total) * 50 +
        (duplicates / max(len(df), 1)) * 50
    ) * 100

    return {
        "score": max(0, round(score, 2)),
        "missing_percent": round((missing / total) * 100, 2)
    }


# =========================
# JSON SAFE
# =========================
def make_json_safe(df):
    df = df.copy()
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.fillna(0)
    df = df.astype(object)
    df = df.where(pd.notnull(df), None)
    return df


# =========================
# UPLOAD
# =========================
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    global global_df

    try:
        if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx")):
            return {"error": "Only CSV or Excel allowed"}

        if file.filename.endswith(".csv"):
            df = pd.read_csv(file.file)
        else:
            df = pd.read_excel(file.file)

        if df is None or df.empty:
            return {"error": "Invalid or empty file"}

        df.columns = df.columns.str.strip().str.lower()
        df = df.drop_duplicates()

        for col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        df = df.replace([np.inf, -np.inf], np.nan)
        df = df.fillna(0)

        global_df = df

        quality = compute_quality(df)

        insights = []
        for col in df.select_dtypes(include="number").columns:
            avg = df[col].mean()
            insights.append(f"{col} avg: {round(avg,2)}")

        numeric_cols = list(df.select_dtypes(include="number").columns)

        safe_df = make_json_safe(df.head(50))

        return {
            "data": safe_df.to_dict(orient="records"),
            "numeric_columns": numeric_cols[:5],
            "insights": insights,
            "quality": quality
        }

    except Exception as e:
        logging.error(str(e))
        return {"error": str(e)}


# =========================
# DOWNLOAD
# =========================
@app.get("/download")
async def download():
    global global_df

    if global_df is None:
        return {"error": "No data uploaded"}

    df = global_df.copy()

    try:
        df = df.fillna(0)

        numeric_cols = df.select_dtypes(include=np.number).columns

        if len(numeric_cols) >= 2:
            target = numeric_cols[-1]

            X = df.drop(columns=[target])
            y = df[target]

            X = X.select_dtypes(include=np.number)

            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            model = RandomForestRegressor()
            model.fit(X_scaled, y)

            df["prediction"] = model.predict(X_scaled)

    except Exception as e:
        logging.warning(str(e))

    file_path = "cleaned_with_predictions.csv"
    df.to_csv(file_path, index=False)

    return FileResponse(file_path, filename="cleaned_with_predictions.csv")


# =========================
# TRAIN (🔥 FIXED)
# =========================
@app.get("/train")
def train_model():
    global global_df

    try:
        if global_df is None:
            return {"error": "No data uploaded"}

        df = global_df.copy().fillna(0)

        numeric_cols = df.select_dtypes(include=np.number).columns

        if len(numeric_cols) < 2:
            return {"error": "Not enough numeric columns"}

        target = df[numeric_cols].var().idxmax()

        X = df.drop(columns=[target])
        y = df[target]

        X = X.select_dtypes(include=np.number)

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )

        if y.nunique() < 10:
            model = RandomForestClassifier()
            model_type = "classification"
        else:
            model = RandomForestRegressor()
            model_type = "regression"

        model.fit(X_train, y_train)

        score = model.score(X_test, y_test)

        # 🔥 MAIN FIX: SAVE FEATURES ALSO
        joblib.dump({
            "model": model,
            "features": list(X.columns)
        }, "model.pkl")

        return {
            "status": "success",
            "model_type": model_type,
            "target": target,
            "score": round(score * 100, 2)
        }

    except Exception as e:
        logging.error(str(e))
        return {"error": str(e)}


# =========================
# 🔥 PREDICT (FINAL FIX)
# =========================
@app.post("/predict")
async def predict(data: dict):
    try:
        # ❌ अगर model नहीं है
        if not os.path.exists("model.pkl"):
            return {"error": "Model not trained yet. Please click Train Model first."}

        saved = joblib.load("model.pkl")

        model = saved["model"]
        features = saved["features"]

        values = []

        for col in features:
            val = data.get(col, 0)

            try:
                val = float(val)
            except:
                val = 0

            values.append(val)

        values = np.array(values).reshape(1, -1)

        prediction = model.predict(values)[0]

        return {"prediction": float(prediction)}

    except Exception as e:
        logging.error("PREDICT ERROR: " + str(e))
        return {"error": str(e)}