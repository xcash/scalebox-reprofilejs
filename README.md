# ReProfileJS

ReProfileJS stands for **Re**mote **Profile** **J**ava**S**cript.
It's a very lightweight *framework-independent* (and *framework-enhanced*) javascript library to profile remotely and log the performance of web applications.

## Features

- Framework independent but framework enhanced (Mootools and JQuery supported)
- Mobile compatible
- Logs on console and/or remotely
- JSON data format
- Low priority logging (your applicatin won't be slower with active logging, so you can use it in production to gather profiling information)

## Stable Release

... work in progress ...

## Quick Start

Just download the sources in your content directory and import the file in the <head> of your page

    <script type="text/javascript" src="/js-files/reprofile.js"></script>
	
For better results place it on top before any other file inclusion.

Now place the call to Profiling.log(message) in every step you'd like to profile.

*messages* can be a string or a list of any type of json-friendly arguments. They're saved with the log step information.

Examples:

    Profiling.log("app fully started");

    Profiling.log("loader", "sprite loading started");
	...
    Profiling.log("loader", "sprite loading complete");

    Profiling.log("spells", { type: 'fire', action: 'rendering', animation_id: 123 });

The call does the something:
- write to console if available
- if no console.log available opens a window.alert (useful for mobile development) **only if configured to do so**
- if configured, sends the event asynchronously to backend server (see below)

## Configuring remote event logging

Just add following line before the module impoort:

    <script type="text/javascript">Profiling = {"url" : "/logpage"}</script>
