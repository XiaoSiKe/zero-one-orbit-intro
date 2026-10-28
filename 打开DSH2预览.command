#!/bin/zsh
set -eu

project_dir=${0:A:h}
preview_url='http://127.0.0.1:4178/preview/rixin.html'
preview_html=$(curl -fsS --max-time 2 "$preview_url" 2>/dev/null || true)
if [[ "$preview_html" == *'window.__DSH_STARTUP__'* ]]; then
  open "$preview_url"
  exit 0
fi

if command -v node >/dev/null 2>&1; then
  preview_node=$(command -v node)
elif [[ -x '/Applications/DeepSeek Harness.app/Contents/Resources/runtime/primary-runtime/dependencies/node/bin/node' ]]; then
  preview_node='/Applications/DeepSeek Harness.app/Contents/Resources/runtime/primary-runtime/dependencies/node/bin/node'
else
  echo '未找到 Node.js。请先安装 Node.js 20 或更新版本。'
  read -r '?按回车关闭…'
  exit 1
fi

"$preview_node" "$project_dir/dsh-startup-screen/preview/server.mjs" &
preview_pid=$!
trap 'kill "$preview_pid" 2>/dev/null || true' EXIT
for preview_attempt in {1..30}; do
  if ! kill -0 "$preview_pid" 2>/dev/null; then
    wait "$preview_pid"
    exit 1
  fi
  preview_html=$(curl -fsS --max-time 1 "$preview_url" 2>/dev/null || true)
  if [[ "$preview_html" == *'window.__DSH_STARTUP__'* ]]; then
    open "$preview_url"
    echo '预览已打开。保留此窗口；按 Ctrl+C 停止本次启动的服务。'
    wait "$preview_pid"
    exit 0
  fi
  sleep 0.1
done
echo '预览服务尚未就绪，请检查端口 4178 是否被占用。'
exit 1
