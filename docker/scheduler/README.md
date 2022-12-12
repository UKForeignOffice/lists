To test this locally, use [minikube](https://minikube.sigs.k8s.io/docs/start/).

Minikube allows you to run kubernetes deployments on your local machine. 

Assume all commands are run from the root directory of the project.

## Setup 
1. install minikube 
2. Start minikube `$ minikube start`
3. Switch minikube to target your local docker-env `$ eval $(minikube docker-env)` 
4. Build the docker image `$ docker build --target scheduled -t scheduled:latest --build-arg BUILD_MODE=ci .`
5. Check that minikube has access to your images `$ minikube image ls`. You should see `docker.io/library/scheduled:latest` (or however you decided to name/tag the container)
6. Create a new deployment for the setup/batch process `kubectl create -f /workspaces/lists/docker/scheduler/setup.yml`
7. Create a new deployment for the worker process `kubectl create -f /workspaces/lists/docker/scheduler/worker.yml`

## Check it works 
After setting up
1. run `$ kubectl get pods`, you should see the setup and worker pods.
2. run `$ kubectl logs $POD_NAME` to check the logs. The `setup` job should print "running batch process"
