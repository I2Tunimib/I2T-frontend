# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Workflows
Two workflows are defined for this repository:

1. **push-image**: triggered on a push action on `dev` branch. This workflow builds a docker image with the backend and frontend builds and pushes it to both DockerHub and GitHub Container.

2. **deploy-pipeline**: triggered on (TBD: probably on push on `main` branch or when tagging a commit with a new release). This workflow adds a step to the previous pipeline which pulls the **release** image from GitHub Container and builds a container on a remote host.

**Notes about the pipelines**: since the backend serves both the API and the frontend static files, the only way to have an updated image is to build both frontend and backend for each repository when a new version is released.

#### Skip workflows
To skip workflows add to the commit message `[skip ci]`. This way it won't be triggered.

## Pulling an image

### Pulling an image from DockerHub and build a container
The image is available here: https://hub.docker.com/repository/docker/i2tunimib/i2t.

1. Login to DockerHub:
```bash
docker login i2tunimib
```
2. As password insert the DockerHub token. You can find it [here](https://drive.google.com/file/d/1i5OQcZP-MeiwKtVomkBrBoqmOD2Q6ETX/view?usp=sharing).
3. Pull the image:
```bash
docker pull i2tunimib/i2t
```
4. Build container
```bash
docker run -d -p 3002:3002 i2tunimib/i2t
```

### Pulling an image from GitHub Container and build a container
The image is available here: https://github.com/I2Tunimib/I2T-backend/pkgs/container/i2t.

1. Create a new **Personal Access Token** with `write:packages` permissions. https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token
2. Save your token as environment variable:
```bash
export CR_PAT=YOUR_TOKEN
```
3. Login to the Container registry:
```bash
echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
```
3. Pull the image:
```bash
docker pull ghcr.io/i2tunimib/i2t:latest
```
4. Build container
```bash
docker run -d -p 3002:3002 ghcr.io/i2tunimib/i2t
```

**N.B.:** since GitHub has rate limits when pulling images from the container try to keep the GitHub image for release only (i.e.: automatically deployed by the pipeline on a new release)

## Build an image locally

1. Build the frontend application and move the build folder in the root of the backend repository https://github.com/I2Tunimib/I2T-backend.
2. Build an image:
```bash
docker-compose build ['candidate' | 'release']
``` 
**candidate** and **release** build the same image. What changes is the registry where it's going to be pushed (if pushed). Candidate pushes to DockerHub, release pushes to GitHub.

3. Build a container with the built image:
```bash
docker-compose up -d ['candidate' | 'release']
```