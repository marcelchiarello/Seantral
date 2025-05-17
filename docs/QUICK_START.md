# Seantral Quick Start Guide

This guide will help you quickly set up and run the Seantral platform locally for development.

## Prerequisites

Ensure you have the following installed:

- **Node.js** (v18.0.0 or newer)
- **npm** (v8.0.0 or newer)
- **pnpm** (v8.0.0 or newer)
- **Python** (3.12)
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/seantral.git
cd seantral
```

### 2. Install Dependencies

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `COPERNICUS_USERNAME` - Your Copernicus Marine account username
- `COPERNICUS_PASSWORD` - Your Copernicus Marine account password

### 4. Set Up Python Environment

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r apps/api/requirements.txt
pip install -e packages/data-pipeline
```

## Running the Application

### Start the Development Servers

#### 1. Start the API Server

```bash
# In one terminal
cd apps/api
pnpm dev
```

This will start the FastAPI server at `http://localhost:3001`.

#### 2. Start the Web Application

```bash
# In another terminal
pnpm dev
```

This will start the Next.js development server at `http://localhost:3000`.

## Key Features and How to Use Them

### Interactive Map

The dashboard includes an interactive map displaying marine data:

1. Navigate to `http://localhost:3000/dashboard`
2. The map shows various data points from Copernicus and NOAA
3. Click on a buoy or region to view detailed data

### Time Series Data

To view time series data:

1. Click on a point of interest on the map
2. The time series chart will update with relevant data
3. Use the date range selector to adjust the time period

### Data Sources

Seantral integrates data from:

- **Copernicus Marine Environment Monitoring Service** - Ocean data
- **NOAA National Data Buoy Center** - Buoy measurements

## Development Commands

```bash
# Run linting
pnpm lint

# Run tests
pnpm test

# Build for production
pnpm build
```

## Docker Support

To run the application using Docker:

```bash
# Build and start containers
docker-compose up -d

# Stop containers
docker-compose down
```

## Troubleshooting

### Common Issues

1. **API connection error**
   - Ensure the API server is running on port 3001
   - Check that your firewall isn't blocking connections

2. **Supabase authentication issues**
   - Verify your Supabase credentials in `.env.local`
   - Ensure your Supabase project has the required tables

3. **Data not loading**
   - Check your Copernicus and NOAA credentials
   - Ensure your network can access these external services

### Getting Help

If you encounter problems:

1. Check the [documentation](./README.md)
2. Look for similar issues on GitHub
3. Open a new issue with detailed information about your problem

## Next Steps

- Explore the [architecture document](./architecture.md) to understand the system design
- Read the [contributing guide](./CONTRIBUTING.md) to learn how to contribute
- Set up a [production deployment](./DEPLOYMENT.md) for a live environment

Enjoy using Seantral! 