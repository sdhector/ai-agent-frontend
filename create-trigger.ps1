# Create Cloud Build trigger for AI Agent Frontend
gcloud builds triggers create github `
  --project=professional-website-462321 `
  --name="ai-agent-frontend-deploy-to-firebase" `
  --description="Deploy AI Agent Frontend to Firebase" `
  --repo-owner=sdhector `
  --repo-name=ai-agent-frontend `
  --branch-pattern="^master$" `
  --build-config=cloudbuild.yaml `
  --service-account="projects/professional-website-462321/serviceAccounts/firebase-deployer@professional-website-462321.iam.gserviceaccount.com" `
  --include-logs-with-status
