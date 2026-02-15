# Frontend Configuration (Docker Compose)

This service runs the **DriveXpand Frontend**, a React application served via Nginx. It is designed to be configured dynamically using environment variables in `docker-compose.yml`.

### Quick Start

Add the following service definition to your `docker-compose.yml` file:

```yaml
services:
  # ... other services (e.g., your backend 'app') ...

  frontend-image:
    image: ghcr.io/drivexpand/drivexpand-frontend:latest
    container_name: drivexpand-frontend
    restart: always
    depends_on:
      - app
    ports:
      - "8070:80"
    environment:
      # URL of the backend service (internal Docker network URL)
      - BACKEND_URL=http://app:8080

```

### Configuration Options

| Environment Variable | Description | Default | Example |
| --- | --- | --- | --- |
| `BACKEND_URL` | The URL of the backend API service. This is used by Nginx to proxy API requests (avoiding CORS issues). | *None* (Required) | `http://app:8080` or `http://backend-service:3000` |
| `PORT` (External) | The port on your host machine where the frontend will be accessible. | `80` (Internal) | `8070:80` (Access at `http://localhost:8070`) |

### Troubleshooting

If the application loads but API calls (login, data fetching) fail with **404** or **502 Bad Gateway**:

1. **Check the logs** to ensure Nginx substituted the variable correctly:
```bash
docker logs drivexpand-frontend

```


*Look for lines mentioning `envsubst` or the start of the Nginx process.*
2. **Verify the Configuration** inside the running container:
```bash
docker exec drivexpand-frontend cat /etc/nginx/conf.d/default.conf

```


*Ensure the `proxy_pass` directive shows the actual URL (e.g., `http://app:8080`) and not the variable `${BACKEND_URL}`.*
3. **Network Check:** Ensure the container name in `BACKEND_URL` matches the service name of your backend in `docker-compose.yml` (e.g., `app`).
