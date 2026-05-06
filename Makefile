# Main target to start both backend and frontend
start:
	@echo "Starting full stack app..."
	$(MAKE) start-backend & $(MAKE) start-frontend

# Start the backend server using Uvicorn
start-backend:
	( \
		cd backend && \
		. ./venv/bin/activate && \
		uvicorn main:app --reload --host 0.0.0.0 --port 8000 \
	)
# Start the frontend server
start-frontend:
	@echo "Starting Frontend..."
	npm run dev --prefix books_frontend


# Stop both backend and frontend
stop:
	@echo "Stopping processes on ports 8000 and 5173..."
	@lsof -t -i:8000 | xargs kill -9 2>/dev/null || echo "Backend already stopped."
	@lsof -t -i:5173 | xargs kill -9 2>/dev/null || echo "Frontend already stopped."