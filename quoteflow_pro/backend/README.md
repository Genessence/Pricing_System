# Backend Setup and Run Instructions

## Steps to Run

1. **Clone the repository**

   ```
   git clone
   ```
2. **Navigate to backend folder**

   ```bash
   cd backend
   ```
3. **Create virtual environment**

   ```bash
   python -m venv venv
   ```
4. **Activate virtual environment**

   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On Linux/Mac:
     ```bash
     source venv/bin/activate
     ```
5. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```
6. **Run the server**

   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

The backend will start on [http://localhost:8000](http://localhost:8000/).

```

```
