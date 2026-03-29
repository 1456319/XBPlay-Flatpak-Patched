#!/usr/bin/env python3
"""
Comprehensive diagnostic for Play Xbox Play (Edge PWA) splash screen hang
Targets the actual Microsoft Edge Flatpak PWA processes
"""

import json
import time
import subprocess
import os
from datetime import datetime
from pathlib import Path

OUTPUT_DIR = Path("/home/deck/dump/xbplay spare parts")

def run_cmd(cmd):
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=15)
        return result.stdout + result.stderr
    except Exception as e:
        return f"Error: {e}"

def get_edge_pwa_info():
    """Gather information about the Edge PWA processes"""
    info = {}
    
    # Find Edge processes
    # The PWA usually runs with specific flags
    edge_pids = run_cmd("pgrep -f 'msedge.*enable-features=WebRTCPipeWireCapturer'").strip().split('\n')
    info['all_edge_pids'] = edge_pids
    
    # Identify the main PWA process (usually has the app-id or similar)
    pwa_process = run_cmd("ps -eo pid,pcpu,pmem,args | grep msedge | grep -v grep | grep 'app-id' | head -1").strip()
    info['pwa_main_process'] = pwa_process
    
    # Identify renderer processes (high CPU ones)
    renderers = run_cmd("ps -eo pid,ppid,pcpu,pmem,args --sort=-pcpu | grep msedge | grep renderer | head -5").strip()
    info['top_renderers'] = renderers
    
    # Identify the 'instant-process' which often hangs
    instant_process = run_cmd("pgrep -f 'msedge.*instant-process'").strip()
    info['instant_process_pids'] = instant_process
    
    return info

def trace_renderer(pid):
    """Trace a specific renderer process"""
    if not pid:
        return "No PID provided"
    
    print(f"Tracing PID {pid} for 10 seconds...")
    trace = run_cmd(f"timeout 10 strace -p {pid} -c 2>&1")
    return trace

def get_flatpak_logs():
    """Get logs from the Edge Flatpak"""
    # Try journalctl
    logs = run_cmd("journalctl -u xdg-desktop-portal --since '1 hour ago' | grep -i edge")
    
    # Try looking for Edge's own debug logs in the sandbox
    debug_logs = run_cmd("find ~/.var/app/com.microsoft.Edge -name 'chrome_debug.log' 2>/dev/null")
    
    log_content = ""
    if debug_logs.strip():
        for log_path in debug_logs.strip().split('\n'):
            log_content += f"\n--- {log_path} ---\n"
            log_content += run_cmd(f"tail -200 {log_path}")
            
    return {
        'portal_logs': logs,
        'debug_log_paths': debug_logs,
        'debug_log_content': log_content
    }

def main():
    timestamp = int(time.time())
    print("=" * 80)
    print("Edge PWA Diagnostic: Play Xbox Play")
    print("=" * 80)
    
    # 1. Process Info
    print("[1/4] Gathering Edge process info...")
    edge_info = get_edge_pwa_info()
    
    # 2. Trace the renderer
    print("[2/4] Tracing main renderer...")
    # Find the most active renderer
    main_renderer = run_cmd("ps -eo pid,pcpu,args --sort=-pcpu | grep msedge | grep renderer | head -1 | awk '{print $1}'").strip()
    
    renderer_trace = ""
    if main_renderer:
        renderer_trace = trace_renderer(main_renderer)
        edge_info['main_renderer_pid'] = main_renderer
    else:
        # Try the instant-process
        instant_pid = edge_info['instant_process_pids'].split('\n')[0] if edge_info['instant_process_pids'] else None
        if instant_pid:
            print(f"Tracing instant-process {instant_pid} instead...")
            renderer_trace = trace_renderer(instant_pid)
            edge_info['instant_process_renderer_pid'] = instant_pid

    # 3. Flatpak context
    print("[3/4] Gathering Flatpak environment info...")
    flatpak_env = {
        'info': run_cmd("flatpak info com.microsoft.Edge"),
        'ps': run_cmd("flatpak ps"),
        'overrides': run_cmd("flatpak override --show com.microsoft.Edge")
    }
    
    # 4. Logs
    print("[4/4] Gathering logs...")
    logs = get_flatpak_logs()
    
    # Save reports
    with open(OUTPUT_DIR / f"edge_process_info_{timestamp}.json", 'w') as f:
        json.dump(edge_info, f, indent=2)
        
    with open(OUTPUT_DIR / f"strace_edge_renderer_{timestamp}.json", 'w') as f:
        json.dump({'summary': renderer_trace}, f, indent=2)
        
    with open(OUTPUT_DIR / f"flatpak_env_{timestamp}.json", 'w') as f:
        json.dump(flatpak_env, f, indent=2)
        
    print(f"\nDiagnostic complete. Results saved to {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
