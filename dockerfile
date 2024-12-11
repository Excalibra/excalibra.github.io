# Pull Alpine Linux
FROM alpine
RUN apk update
RUN apk add ruby
RUN mkdir -p /writen/_posts && gem install rake
# Copy multiple files from the host to the image
COPY ["./Rakefile", "_posts", "/writen/_posts/"]
# Copy a folder from the container to the host
# Command: `docker cp 89f4a3cc45d9:/writen/ /Users/Excalibra/Desktop/`
