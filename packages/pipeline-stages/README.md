# Brisk Docs Core Pipeline

This library contains the core modules that Brisk Docs uses to read docs from a monorepo and generate the code for
pages in the docs website.

Brisk's website generation functionality is broken down into a series of stages that can be run independently or in a
complete pipeline. This package exposes the following stages:

 - Scan metadata: Scans the source of a monorepo and extract information about packages and docs within
 - Generate website info: Creates a plan for the structure of the docs website using provided metadata
 - Generate pages: Writes files to disk for all the pages to be built into the running website

For creating and running a docs website end to end please use `@brisk-docs/gatsby-generator`.
