 # Updated fork 

- switched to using all jsx files with vite instead of depreciated create-react-app

- added windows media player 

- anime stuf

- made most things work on mobile including resizing the windows

- check it out here   https://exe.bot

# WinXP

🏁 Web based Windows XP desktop recreation.

Features:

- Drag and resize, minimize, maximize windows
- Open applications from desktop icons or start menu
- Minesweeper, Internet Explorer, My Computer, Notepad, Winamp, Paint
- Power off menu

## [Try it!](https://exe.bot)

Windows XP 👉 https://exe.bot

[![](demo/demo.gif)](https://exe.bot)

## Local development

```bash
npm install
npm start
```

## Self-hosting

A `Dockerfile` and Kubernetes manifests under `k8s/` are included for
self-hosters. The container is a static nginx image serving the Vite
build output.

```bash
docker build -t <your-registry>/anime-win-xp:latest .
docker push   <your-registry>/anime-win-xp:latest
kubectl apply -f k8s/
```

Edit the image reference in `k8s/deployment.yaml` and the hostname in
`k8s/ingress.yaml` to match your own setup.

## Contributing

Generally open an issue (or comment on an issue if there's one already) before starting work on a PR.

## License

The Windows XP name, artwork, trademark are surely property of Microsoft. This project is provided for educational purposes only. It is not affiliated with and has not been approved by Microsoft.

## Thanks
- [Webamp](https://github.com/captbaritone/webamp), Winamp 2 reimplementation by: [captbaritone](https://github.com/captbaritone)
- [JS Paint](https://github.com/1j01/jspaint), Paint reimplementation by: [1j01](https://github.com/1j01)
