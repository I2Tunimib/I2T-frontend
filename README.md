# table-riconciliator-service

## Deploy workflow
A deploy workflow is triggered when a new release is published on the main branch. Deploy steps:

1. Clone backend repository
2. Clone frontend repository
3. Build frontend and move the build to backend folder
4. Build new image and push it to DockerHub and GitHub
5. Copy docker-compose and .env file to remote host
6. Through SSH shutdown old container and remove old images
7. Through SSH pull new image and build new container

#### Skip workflows
To skip workflows add to the commit message `[skip ci]`. This way it won't be triggered.

## Upload and download tables
Two volumes are mounted for tables and annotated tables.
- /datahdd/asia/I2T-backend/tables
- /datahdd/asia/I2T-backend/saved

To download a folder use **scp**:
```bash
scp -r username@host_url:path_to_remote_folder path_to_local_folder
```

To upload new tables:
```bash
 scp file1 file2 [more files] username@host_url:path_to_remote_folder
```
You can also upload all files inside a folder:
```bash
 scp path_to_local_folder/* username@host_url:path_to_remote_folder
```


## Pulling an image

### Pulling an image from DockerHub
The image is available here: https://hub.docker.com/repository/docker/i2tunimib/i2t.

1. Login to DockerHub:
```bash
docker login i2tunimib
```
2. As password insert the DockerHub token. You can find it [here](https://drive.google.com/file/d/1i5OQcZP-MeiwKtVomkBrBoqmOD2Q6ETX/view?usp=sharing).
3. Pull the image:

- using docker-compose:
```bash
docker-compose pull candidate
```
- using docker:
```bash
docker pull i2tunimib/i2t
```
4. Build container:

- using docker-compose:
```bash
docker-compose up -d candidate
```

- using docker:
```bash
docker run -p 3002:3002 -d i2tunimib/i2t
```


### Pulling an image from GitHub Container
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
4. Pull the image:

- using docker-compose:
```bash
docker-compose pull release
```
- using docker:
```bash
docker pull ghcr.io/i2tunimib/i2t:latest
```
5. Build container:
- using docker-compose:
```bash
docker-compose up -d release
```
- using docker:
```bash
docker run -p 3002:3002 -d ghcr.io/i2tunimib/i2
```

**N.B.:** since GitHub has rate limits when pulling images from the container try to keep the GitHub image for release only (i.e.: automatically deployed by the pipeline on a new release)

## Build an image locally

1. Be sure to build the frontend application https://github.com/I2Tunimib/I2T-frontend and move the build folder in the root of this repository.
2. Build an image:
```bash
docker-compose build ['candidate' | 'release']
``` 
**candidate** and **release** build the same image. What changes is the registry where it's going to be pushed (if pushed). Candidate pushes to DockerHub, release pushes to GitHub.

3. Build a container with the built image:
```bash
docker-compose up -d ['candidate' | 'release']
```
