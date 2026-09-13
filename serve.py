import http.server
import socketserver

PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
})

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
