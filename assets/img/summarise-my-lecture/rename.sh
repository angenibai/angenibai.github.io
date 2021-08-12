#!/bin/sh

for img in *.png
do
    #img2=$(echo $img | sed -r 's/Untitled ([0-9]+)/sml-\1.png/')
    img2=$(echo $img | sed -r 's/\.png//')
    mv "$img" "$img2"
done

