# Scan metadata build stage

This is the start of the Brisk pipeline. During this stage, the target project is scanned in order to find all the
packages, examples and docs that will be used in the final website. The output of this stage is a data structure
containing all of this info.

This stage should be the only one in the pipeline to be reading the user's filesystem to find the location of important
files or for other metadata. This is to avoid harmful couplings of the filesystem to the finished website.
