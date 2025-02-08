FROM golang:latest as installer

RUN go install github.com/yokomotod/bqiam@089b40e


FROM asia.gcr.io/google.com/cloudsdktool/google-cloud-cli:stable

RUN apt-get update -qqy && apt-get install -qqy \
      ca-certificates

COPY --from=installer /go/bin/bqiam /usr/local/bin/bqiam

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
