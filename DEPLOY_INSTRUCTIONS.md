# AWS Amplify Deployment Guide

Since your local system is currently preventing automated deployment (Error 0xC0000409), please follow these steps **after restarting your computer**.

## Option 1: Deploy via GitHub (Recommended)
1.  **Push your code to GitHub**:
    Open your terminal (Command Prompt or PowerShell) and run:
    ```bash
    git add .
    git commit -m "Ready for deployment"
    git push origin main
    ```
2.  **Connect to AWS Amplify**:
    - Go to the [AWS Management Console](https://console.aws.amazon.com/).
    - Search for **AWS Amplify**.
    - Click **Check it out** (or **New App** -> **Host web app**).
    - Select **GitHub** and click **Continue**.
    - Authorize AWS to access your GitHub account.
    - Select the repository `Sellfast-saass-` and the branch `main`.
    - Click **Next**.
3.  **Configure Build Settings**:
    - AWS Amplify should automatically detect the settings from `amplify.yml`.
    - Ensure the build command is `npm run build` and the output directory is `dist`.
    - Click **Next**, then **Save and Deploy**.

## Option 2: Manual Deployment (Drag & Drop)
If you cannot use Git:
1.  **Build the project locally**:
    ```bash
    npm run build
    ```
    (This will create a `dist` folder).
2.  **Upload to Amplify**:
    - Go to **AWS Amplify** in the console.
    - Select **Host web app**.
    - Choose **Deploy without Git provider**.
    - Drag and drop the `dist` folder into the upload area.
    - Click **Save and Deploy**.

## Important Note
Your `amplify.yml` file is already correctly configured:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
```
