# AutoSurfer

## Overview

This project features an autonomous web agent designed to perform user-specified tasks on the web, integrating the power of Large Multimodal Models (LMMs) like GPT-4o with browser automation using Selenium. The application includes:

- A **frontend** for user interaction (branch: `master`).
- A **backend** for processing user inputs and managing automation (branch: `backend`).

The agent can handle complex tasks, such as navigating websites, filling out forms, and extracting information, while providing real-time feedback to the user.


https://github.com/user-attachments/assets/5834e37d-eff6-40d3-88df-540bbf2da725


---

## Features

- **Frontend**:
  - User-friendly interface for task submission and monitoring.
  - Live feedback showing the agent’s progress through screenshots.
  - Dropdown for selecting AI models (currently GPT-4o).
  
- **Backend**:
  - Communication with OpenAI APIs for reasoning and task execution.
  - Integration with Selenium for browser automation.
  - Flexible architecture allowing future enhancements and scalability.

---

## Project Structure

### Branches

- `master` (Frontend)
  - Built with **React** and **Next.js**.
  - Components styled using **NextUI**.
  
- `backend`
  - Developed with **Python** and **Flask**.
  - Automates the browser using **Selenium**.
  - Workflow management via **n8n**.

---

![Architecture](https://github.com/user-attachments/assets/a249c4de-bf67-4577-baa4-ad55b93b23ab)

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (for the frontend)
- **Python 3.9+** (for the backend)
- **Chrome WebDriver** (compatible with your Chrome browser version)
- **Git**

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/autonomous-web-agent.git
   cd autonomous-web-agent
   ```

2. **Setup Frontend (master branch)**
   ```bash
   git checkout master
   cd frontend
   npm install
   ```

3. **Setup Backend (backend branch)**
   ```bash
   git checkout backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. **Install Chrome WebDriver**
   - Download the appropriate version for your Chrome browser from [here](https://chromedriver.chromium.org/downloads).
   - Place it in a directory included in your system’s PATH.

---

## Running the Application

### Start the Backend
```bash
cd backend
python app.py
```

### Start the Frontend
```bash
cd frontend
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## Usage

1. Enter the task you want the web agent to complete in the input field.
2. Optionally, provide a starting website URL.
3. Click "Submit" to see the agent navigate the web and perform actions.
4. Monitor the progress through real-time screenshots and logs.

---

## Technologies Used

- **Frontend**: React, Next.js, NextUI
- **Backend**: Python, Flask, Selenium, OpenAI API
- **Workflow Automation**: n8n
- **Browser Automation**: Chrome WebDriver

---

## Future Enhancements

- Support for additional LMMs like Gemini.
- Enhanced UI with more customization options.
- Improved scalability for high-volume tasks.

---
