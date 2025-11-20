# NMS Sentinel Project

This project consists of two main components:
1. **NMSSentinelPy** - A Python backend API service
2. **nmss-dashboard** - A React frontend dashboard

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

## Backend Setup (NMSSentinelPy)

1. Navigate to the backend directory:
   ```bash
   cd NMSSentinelPy/NMSSentinelPy
   ```

2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     .venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source .venv/bin/activate
     ```

4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the backend server:
   ```bash
   python main.py
   ```

The backend will start on `http://127.0.0.1:8000`

## Frontend Setup (nmss-dashboard)

1. Navigate to the frontend directory:
   ```bash
   cd nmss-dashboard/nmss-dashboard
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:5173`

## Usage

1. Start both the backend and frontend servers as described above
2. Open your browser and navigate to `http://localhost:5173`
3. Log in with the default credentials:
   - Username: `admin`
   - Password: `adminpass`
4. Use the dashboard to manage API keys and test the NMS proxy

## Security Notes

- The default credentials should be changed in production
- The API uses JWT tokens for authentication
- All communication between frontend and backend should use HTTPS in production

## API Endpoints

- `GET /` - Health check
- `POST /admin/token` - Obtain JWT token
- `GET /admin/apikeys` - List all API keys
- `POST /admin/apikeys` - Create a new API key
- `GET /nms/proxy` - Test NMS proxy functionality