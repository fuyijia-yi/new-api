{
  "version": 2,
  "builds": [
    {
      "src": "web/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "web/dist",
        "installCommand": "npm install",
        "buildCommand": "DISABLE_ESLINT_PLUGIN='true' VITE_REACT_APP_VERSION=$(cat VERSION) npm run build"
      }
    },
    {
      "src": "main.go",
      "use": "@vercel/go"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "main.go"
    },
    {
      "src": "/(.*)",
      "dest": "web/dist/$1"
    }
  ]
}
