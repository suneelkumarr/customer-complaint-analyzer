# Customer Complaint Analysis Backend

A Node.js Express backend service that leverages Large Language Models (LLM) to analyze customer complaints and extract structured information, including a concise summary, category, urgency level, and sentiment.

---

## 🚀 Features

- **LLM Integration:** Uses [OpenRouter](https://openrouter.ai) API with support for multiple language models.
- **Structured Analysis:** Automatically detects and extracts:
  - Summary
  - Complaint Category (e.g., Billing, Technical Support)
  - Urgency Level (Low, Medium, High)
  - Sentiment (Positive, Neutral, Negative)
- **RESTful API:** One powerful endpoint: `POST /api/summarize`
- **Input Validation:** Ensures robustness through detailed request validation.
- **Error Handling:** Meaningful status codes and messages for all errors.
- **Testing Suite:** Built-in tests to validate the API functionality.
- **Health Monitoring:** Simple `/health` endpoint to check service status.

---

## 🛠 Tech Stack

| Layer          | Tool/Service              |
|----------------|---------------------------|
| Runtime        | Node.js                   |
| Framework      | Express.js                |
| LLM Provider   | OpenRouter API            |
| Security       | Helmet.js, Rate Limiting  |
| CORS Support   | Yes                       |
| Testing        | Node.js assert/test       |

---

## 📦 Prerequisites

- Node.js (v14 or higher)
- `npm` or `yarn`
- OpenRouter API key (https://openrouter.ai)

---

## ⚙️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/customer-complaint-analyzer.git
   cd customer-complaint-analyzer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with the following content:

   ```env
   # OpenRouter Configuration
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_MODEL=qwen/qwen3-30b-a3b:free

   # Site Information
   SITE_URL=http://localhost:3000
   SITE_NAME=Customer Complaint Analyzer

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

---

## 📘 API Documentation

### 🔍 Analyze Complaint

- **Endpoint:** `POST /api/summarize`
- **Request Body:**

  ```json
  {
    "message": "Customer complaint text here"
  }
  ```

- **Response:**

  ```json
  {
    "summary": "Brief summary of the complaint",
    "category": "Refund Issue",
    "urgency": "High",
    "sentiment": "Negative"
  }
  ```

### 📑 Categories

- Refund Issue
- Delay
- Account Access
- Product Issue
- Billing
- Technical Support
- Shipping
- Service Quality
- Other

### ⏱️ Urgency Levels

- High – Immediate attention needed
- Medium – Moderate frustration
- Low – Informational or minor issue

### 😊 Sentiment

- Positive
- Neutral
- Negative

---

### 🧪 Health Check

- **Endpoint:** `GET /health`
- **Response:**

  ```json
  {
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "service": "Customer Complaint Analyzer"
  }
  ```

---

## 🧪 Testing

### ✅ Run Built-in Tests

```bash
npm test
```

### 🔧 Manual Testing with cURL

```bash
# Analyze a complaint
curl -X POST http://localhost:3000/api/summarize   -H "Content-Type: application/json"   -d '{"message": "I have been waiting 3 days for my refund and your support has not replied. This is really frustrating."}'

# Health check
curl http://localhost:3000/health
```

### 🧪 Test with Postman

- POST `/api/summarize`
- Headers: `Content-Type: application/json`
- Body:

  ```json
  {
    "message": "I can't access my account and I've tried resetting my password multiple times. This is urgent!"
  }
  ```

---

## ❗ Error Handling

- **400 Bad Request:** Input validation failure
- **401 Unauthorized:** API key missing or invalid
- **429 Too Many Requests:** Rate limiting exceeded
- **500 Internal Server Error:** Server crash or LLM failure

Example:

```json
{
  "error": "Validation error",
  "message": "Message field is required"
}
```

---

## 🔧 Configuration

| Variable             | Description                              | Default                                  |
|----------------------|------------------------------------------|------------------------------------------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key                  | **Required**                             |
| `OPENROUTER_MODEL`   | LLM model to use                         | `qwen/qwen3-30b-a3b:free`                |
| `SITE_URL`           | Site URL for rankings                    | `http://localhost:3000`                  |
| `SITE_NAME`          | Site name for display                    | `Customer Complaint Analyzer`            |
| `PORT`               | Server port                              | `3000`                                   |
| `NODE_ENV`           | Environment mode                         | `development`                            |

---

## 🧠 Supported LLM Models

### Free

- `qwen/qwen3-30b-a3b:free` (default)
- `microsoft/phi-3-mini-128k-instruct:free`
- `huggingfaceh4/zephyr-7b-beta:free`

### Premium

- `openai/gpt-4o`
- `openai/gpt-3.5-turbo`
- `anthropic/claude-3-haiku`
- `google/gemini-pro`
- `meta-llama/llama-3-70b-instruct`

---

## 📁 Project Structure

```
├── server.js              # Entry point
├── package.json           # Project metadata
├── .env                   # Environment config
├── routes/
│   └── complaints.js      # Complaint analysis endpoint
├── services/
│   └── llmService.js      # LLM API logic
├── middleware/
│   ├── validation.js      # Input checks
│   └── errorHandler.js    # Error responses
└── test.js                # Unit test file
```

---

## 🔐 Security Features

- `Helmet.js` for secure HTTP headers
- CORS headers for cross-origin requests
- Rate limiting against abuse
- Environment-based API key control

---

## 🚀 Performance Considerations

- **Timeouts:** 30s timeout on LLM requests
- **Rate Limiting:** Apply for public deployments
- **Response Caching:** Consider Redis or similar
- **Monitoring:** Integrate logging and uptime checks

---

## 🏗️ Production Deployment

- Use **PM2** or similar to manage processes
- Add **nginx** for reverse proxy + load balancing
- Configure **rate limiting** and **timeouts**
- Secure the `.env` file and monitor logs

---

## 📄 License

**MIT License** — Use freely, modify as needed.

---

## 🆘 Support

If you run into issues:

- Check API logs for more details
- Validate your `.env` setup
- Try different LLM models or API keys
- Ensure network access to `https://openrouter.ai`

---

## ⚡ Quick Start Example

```bash
# 1. Install
npm install

# 2. Create .env
echo "OPENROUTER_API_KEY=your_key_here" > .env

# 3. Start server
npm run dev

# 4. Test API
curl -X POST http://localhost:3000/api/summarize   -H "Content-Type: application/json"   -d '{"message": "My order is late and customer service is not responding!"}'
```
