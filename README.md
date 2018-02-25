# Custom Code

A tool to help run a different VS Code version for each project.

This allows you to have different extensions and preferences for each version.

**THIS TOOL WILL CREATE A `code` SHORTCUT AND OVERRIDE YOUR DEFAULT `code` SHORTCUT**

Installing
-----------------------

```shell
npm install -g customcode
```

Or grab the source and

```shell
npm install -g
```

How this tool works
-----------------------

We search  for `code/code` (or `code\code.cmd` for Windows) from the current
working directory (cwd) all the way up to the root directory (`/` or usually
`c:\` on Windows). This is your custom VS Code, with our custom options and
extensions.

If a custom VS Code is not found we will search your `PATH` environment variable
for `code` (or `code.cmd` on Windows) and use that.

We will then launch VS Code forwarding any command line options you passed
originally.

For example, supose your cwd is `/home/user/projects/foo/bar/` and you type on
your terminal:

```bash
~/projects/foo/bar $ code .
```

We will search for:

```
/home/user/projects/foo/bar/code/code
/home/user/projects/foo/code/code
/home/user/projects/code/code
/home/user/code/code
/home/code/code
/code/code
```

Let's say `/home/user/projects/foo/code/code` is found, we will then launch:

```
/home/user/projects/foo/code/code .
```

Using `/home/user/projects/foo/bar/code/code` as the current working directory.

How this tool finds VS Code on your env PATH
------------

We are assuming that your npm bin path is coming before your VS Code path, so we
assume that the first `code` (or `code.cmd` for Windows) that we find is this
tool and the second one is the real VS Code. We will then launch the second one.

If only one `code` is found we will assume it is is this tool and that you don't
have VS Code install and fail with an error message.

Troubleshooting
------------

If we can't find your original `code` then the first thing to do is check your
`PATH` env var and make sure that it's path is there. Also, make sure that the
Node.js bin path shows up before the VS Code path. You can find Node.js's bin
path by running `npm bin -g`.

If your custom VS Code is not running then check your `code` (or `code.cmd`)
script. We are not responsible for it.

Contributing
------------

Questions, comments, bug reports, and pull requests are all welcome.  Submit
them at [the project on GitHub](https://github.com/giggio/customcode).

Bug reports that include steps-to-reproduce (including code) are the best. Even
better, make them in the form of pull requests.

Author
------

[Giovanni Bassi](https://github.com/giggio)

License
-------

Licensed under the Apache License, Version 2.0.

## License

This software is open source, licensed under the Apache License, Version 2.0.
See [LICENSE.txt](https://github.com/giggio/customcode/blob/master/LICENSE.txt)
for details. Check out the terms of the license before you contribute, fork,
copy or do anything with the code. If you decide to contribute you agree to
grant copyright of all your contribution to this project, and agree to mention
clearly if do not agree to these terms. Your work will be licensed with the
project at Apache V2, along the rest of the code.
