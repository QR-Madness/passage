FROM oven/bun

# Setup pre-requisites
RUN bun install -g @go-task/cli

# Copy source dir
COPY . server

# Enter code dir
WORKDIR server

# Install the project
RUN bun install

# Run the default task for now...
CMD task default
