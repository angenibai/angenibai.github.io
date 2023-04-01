---
# Required front matter
layout: post # Posts should use the post layout
title: How to get your money's worth at the Easter Show # Post title
date: 2023-04-02 # Publish date in YYYY-MM-DD format

# Recommended front matter
tags: [web-dev] # A list of tags
splash_img_source: /assets/img/ # Splash image source, high resolution images with an aspect ratio close to 4:3 recommended
splash_img_caption: # Splash image caption

# Optional front matter
updated: # Updated date in YYYY-MM-DD format
author: 
  name: Angeni Bai # Author name, if not provided defaults to site.author.name
  homepage: # Author link, if not provided defaults to site.author.homepage
pin: false # true if this post must be pinned on top of the page, default is false.
listed: true # false if this post must NOT be included on the posts page, sitemap, and any of the tag pages, default is true
index: true # When false, <meta name="robots" content="noindex"> is added to the page, default is true
---

Which showbag gets me the most stuff for the lowest price?

We can grab two key bits of data about each showbag:
1. `retail_value` - how much the items in the bag would cost if they were bought individually
2. `price` - the actual price you can buy the showbag for




## The tech side

Ok so you're interested in how the code actually works.

The whole process is basically simple web-scraping. With some understanding of Python, and how websites are structured, we can figure this out pretty quickly!