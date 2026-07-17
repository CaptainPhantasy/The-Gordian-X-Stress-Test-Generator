import http.client
import os
import threading
import unittest
from contextlib import contextmanager

import server


@contextmanager
def running_server():
    previous_cwd = os.getcwd()
    os.chdir(server.ROOT)
    httpd = server.ThreadingServer(("127.0.0.1", 0), server.Handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    try:
        yield httpd.server_address[1]
    finally:
        httpd.shutdown()
        httpd.server_close()
        thread.join(timeout=2)
        os.chdir(previous_cwd)


class ServerBoundaryTests(unittest.TestCase):
    def test_serves_only_explicit_static_assets(self):
        with running_server() as port:
            connection = http.client.HTTPConnection("127.0.0.1", port)
            connection.request("GET", "/")
            response = connection.getresponse()
            body = response.read()
            self.assertEqual(response.status, 200)
            self.assertIn(b"Gordian-X", body)

            connection.request("GET", "/.git/config")
            response = connection.getresponse()
            response.read()
            self.assertEqual(response.status, 404)
            connection.close()

    def test_rejects_cross_origin_proxy_requests(self):
        with running_server() as port:
            connection = http.client.HTTPConnection("127.0.0.1", port)
            connection.request(
                "POST",
                "/proxy/openai",
                body=b"{}",
                headers={
                    "Content-Type": "application/json",
                    "Origin": "https://attacker.example",
                },
            )
            response = connection.getresponse()
            response.read()
            self.assertEqual(response.status, 403)
            self.assertIsNone(response.getheader("Access-Control-Allow-Origin"))
            connection.close()

    def test_rejects_oversized_proxy_requests_before_upstream(self):
        with running_server() as port:
            connection = http.client.HTTPConnection("127.0.0.1", port)
            connection.request(
                "POST",
                "/proxy/openai",
                body=b"",
                headers={"Content-Length": str(server.MAX_BODY_BYTES + 1)},
            )
            response = connection.getresponse()
            response.read()
            self.assertEqual(response.status, 413)
            connection.close()


if __name__ == "__main__":
    unittest.main()
