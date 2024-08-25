# Use Bun as the base image
FROM oven/bun:latest

WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lockb* ./
RUN bun install

# Copy the rest of your application
COPY . .

# Build the SvelteKit app
RUN bun run build

# Expose the port the app runs on
EXPOSE 3005

# Set the command to run the SvelteKit app
CMD ["bun", "run", "start"]