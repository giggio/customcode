# Custom Code
[![Build
status](https://travis-ci.org/giggio/customcode.svg)](https://travis-ci.org/giggio/customcode/)
[![Build status](https://ci.appveyor.com/api/projects/status/i7iohiwqak1933m9?svg=true)](https://ci.appveyor.com/project/giggio/customcode)
[![npm](https://img.shields.io/npm/dt/customcode.svg)](https://www.npmjs.com/package/customcode)

A tool to help run a custom VS Code for each project. This allows you to have
different user settings and different extensions for each instance.

So, for example, if you are working on an Angular project you use only Angular extensions,
and if you later work on a React project, you use React extensions.

Multiplatform. Tested on Windows and Linux. Node.js based.

This allows you to have different extensions and preferences for each version.

This is only tested on Node.js 8 and 10. We cannot guarantee it on other
Node.js versions.

Installing
-----------------------

```shell
npm install -g customcode
```

Or grab the source and

```shell
npm install -g
```

Using
-----------------------

Simply run `ccode` on any directory and it will search for the custom VS Code and
launch it:

```shell
ccode .
```

You should use `ccode` as you always used `code`. If a custom code is found than
it will be launched, otherwise your system `code` will launch.

To create a custom code (preview) run:

```shell
create-custom-code <destination-directory>
```

This will create a `.code` directory on the specified directory.

How this tool works
-----------------------

We search  for `code/ccode` (or `code\ccode.cmd` for Windows) from the current
working directory (cwd) all the way up to the root directory (`/` or usually
`c:\` on Windows). This is your custom VS Code, with your custom options and
extensions.

If a custom VS Code is not found we will search your `PATH` environment variable
for `code` (or `code.cmd` on Windows) and use that.

We will then launch VS Code forwarding any command line options you passed
originally.

For example, supose your cwd is `/home/user/projects/foo/bar/` and you type on
your terminal:

```bash
~/projects/foo/bar $ ccode .
```

We will search for:

```
/home/user/projects/foo/bar/.code/ccode
/home/user/projects/foo/.code/ccode
/home/user/projects/.code/ccode
/home/user/.code/ccode
/home/.code/ccode
/.code/ccode
```

Let's say `/home/user/projects/foo/.code/ccode` is found, we will then launch:

```
/home/user/projects/foo/.code/ccode .
```

Using `/home/user/projects/foo/bar/` as the current working directory.

Creating a custom VS Code instalation
-----------------------

A custom VS Code simply sets the user data dir and the extensions dir to a
different location. This is what this tool does. It creates the `code`
(`code.cmd` for Windows) and its subdirectories.

To use it simply type `create-custom-code <directory>` to create a custom code
in that directory. The destination directory (`<directory>` above) will receive
a new `code` directory and a `ccode` (or `ccode.cmd`) with the correct
configuration. Extensions will be installed on `.code/extensionsdir` and
settings and other configurations will go on `.code/userdatadir`.

This custom code installation will work seamlessly with the `ccode` tool.

Troubleshooting
------------

If your custom VS Code is not running then check your `ccode` (or `ccode.cmd`)
script. We are not responsible for it.

If you find any problems, open an issue on Github
**with the steps to reproduce your problem**.

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
