---
# Required front matter
layout: post # Posts should use the post layout
title: Easter Showbags for MAXIMUM VALUE # Post title
date: 2023-04-08 # Publish date in YYYY-MM-DD format

# Recommended front matter
tags: [data] # A list of tags
splashImageSource: /img/easter-show-value/easter-show-value-banner.png # Splash image source, high resolution images with an aspect ratio close to 4:3 recommended
splashImageCaption: # Splash image caption

# Optional front matter
updated: # Updated date in YYYY-MM-DD format
author:
  name: Angeni Bai # Author name, if not provided defaults to site.author.name
  homepage: # Author link, if not provided defaults to site.author.homepage
pin: false # true if this post must be pinned on top of the page, default is false.
listed: true # false if this post must NOT be included on the posts page, sitemap, and any of the tag pages, default is true
index: true # When false, <meta name="robots" content="noindex"> is added to the page, default is true
---

The Easter Show is back and like the good enterprising bargain-hunter that I am, the biggest question I have before I go is: **_which showbag can I buy that will get me the most value for my money?_**

Suppose this question occurs to you right before your ethics tutorial. Suppose your friend[^1] says “I bet you could find out with some code”. And crucially, suppose you weren’t really planning on paying that much attention in ethics anyways.

Given those conditions, it appears logical that you would then spend the next couple hours on a journey towards discovering the most cost-effective showbag at the 2023 Royal Sydney Easter Show.

So whether those are your current conditions or not, join me on the steps I took on that journey! And you too can go into the Easter Show confident that you will know exactly how to get the most value for your hard-earned cash.

(but if you’re impatient just read step 5)

## Step 0: understand showbags

Showbags come in all shapes and sizes, but they generally have a certain theme, and a bunch of stuff in it that fits that theme.

For example, there’s Barbie Dreamtopia, which contains a bunch of Barbie items - including a backpack, trinket boxes, and a wand.

<img src="/img/easter-show-value/barbie-dreamtopia-expanded.png" alt="The Barbie Dreamtopia showbag" />

Very magical.

There’s also Allen’s Lollies, which contains - you guessed it - Allen’s lollies.

<img src="/img/easter-show-value/allens-lollies-expanded.png" alt="The Allen's Lollies showbag" />

Most important for us though, is the **retail value** and **price**.

**Retail value** is the amount I would expect to pay if I bought all of the items inside the showbag separately. For Barbie Dreamtopia that’s $70.60.

**Price** is the actual cost of the showbag being sold. So for Barbie Dreamtopia that’s $32.

Now to properly compare the value for money of the showbags, we want to look at the **value to price ratio**. We calculate that by dividing **retail value** by **price**. This means that showbags with a _high_ retail value and a _low_ price will have a _high_ value to price ratio. This is what we want!

Conversely, a _low_ value to price ratio means that we probably might as well buy the items from the bag that we want on their own, and it wouldn’t make much of a difference.

Barbie Dreamtopia has a value to price ratio of 70.60 / 32 = 2.20625.

Allen’s Lollies has a value to price ratio of 15 / 15 = 1.

So with Barbie Dreamtopia we’re more than _doubling_ the value of stuff we get compared to the actual price we pay. Whereas with Allen’s Lollies there is literally no difference if we were to instead grab the Party Mix, Frogs Alive, and Drumstick from Woolies ourselves. Evidently, the value to price ratio is telling us Barbie Dreamtopia is the way to go.

A table to summarise:

|                       | Low price                 | High price                          |
| --------------------- | ------------------------- | ----------------------------------- |
| **Low retail value**  | Low value to price ratio  | Very low value to price ratio (< 1) |
| **High retail value** | High value to price ratio | Low value to price ratio            |

## Step 1: figure out the structure of the web page

Ok time to scope out how we might use some code to get the information that we want.

All of the showbags are accessible at this URL: [https://www.eastershow.com.au/explore/showbags/](https://www.eastershow.com.au/explore/showbags/)

<img src="/img/easter-show-value/showbag-page-1.png" alt="First page of showbags site" />

If we click on a showbag, the section expands and we can see all of its info, including price, what’s included, and total retail value!

<img src="/img/easter-show-value/showbag-page-2.png" alt="First page of showbags site with showbag expanded" />

Since we can access this extra info without navigating to a different page, I’m guessing that all the HTML is loaded with the page, and it’s just some Javascript and CSS in the background that’s showing and hiding sections as necessary.

Using the Inspect Element tool confirms this theory!

The info for each showbag is inside a `showbagsCard` div.

<img src="/img/easter-show-value/showbag-highlight-card.png" alt="Highlighting the showbagsCard div" />

The showbag details including total retail value is then inside a `showbagsCard-description` div.

<img src="/img/easter-show-value/showbag-highlight-description.png" alt="Highlighting an expanded description div" />

We can see this `showbagsCard-description` div also exists under the Avengers Bag `showbagsCard`, but is currently hidden because I haven’t clicked on it yet.

<img src="/img/easter-show-value/showbag-highlight-description-collapsed.png" alt="Highlighting a collapsed description div" />

This is good news! It looks like the HTML is very consistently structured, so we just need to figure out which divs contain the info important to us in each `showbagsCard`.

Showbag **name** is in a `showbagsCard-product--name` heading.

<img src="/img/easter-show-value/showbag-highlight-name.png" alt="Highlighting a name heading" />

**Price** is in a `showbagsCard-product--price` span.

<img src="/img/easter-show-value/showbag-highlight-price.png" alt="Highlighting a price span" />

The list of included **items** is within a `showbagsCard-description-copy--included` div.

<img src="/img/easter-show-value/showbag-highlight-items.png" alt="Highlighting an items div" />

**Retail value** is between `strong` tags in the last paragraph of the `showbagsCard-description-copy--included` div.

<img src="/img/easter-show-value/showbag-highlight-value.png" alt="Highlighting the retail value strong tag" />

## Step 2: pull the info from the web page

So all the info we need has been marked up nicely for us in the HTML, but there’s 51 pages of showbags and going through them manually will be a pain. To help us, we’ll be using the `requests` and `BeautifulSoup` libraries in Python to fetch each page, and extract the right info for each showbag.

### Fetch the web page

Fetching the web page is a simple GET request. With the `requests` library, we just need to pass the URL into the `get()` method.

```python
import requests

SHOWBAGS_URL = "https://www.eastershow.com.au/explore/showbags/"

n = 1
page = requests.get(f"{SHOWBAGS_URL}/?page={n}")
```

Right now, we’ll just fetch the first page. However, we will eventually start looping through values of `n` from 1 to 51.

### Find the right tags

Once we have the HTML for the page, we have to extract the info from the relevant tags that we picked out from before. The `BeautifulSoup` library lets you do that easily without having to do some kind of painful regex matching.

You start by initialising the HTML page as a `BeautifulSoup` object.

```python
from bs4 import BeautifulSoup

soup = BeautifulSoup(page.content, "html.parser")
```

Now, you can run methods on `soup` to search within its structure. Since we know exactly what kinds of tags and classes we need to extract our target information, we will be able to do everything using the `find()` and `find_all()` methods.

For example, to get all instances of the `showbagsCard` div, we pass in `"div"` as the tag type we’re targeting, and `showbagsCard` as the class we’re targeting.

```python
SHOWBAG_DIV = "showbagsCard"

showbags = soup.find_all("div", class_=SHOWBAG_DIV)
```

I’m also defining the name of the showbag class as a constant at the top of the code just so it’s easy to update if something about the webpage changes.

Using this idea, given a showbag `BeautifulSoup` object, this is how we grab the name, price, and total retail value.

```python
SHOWBAG_NAME_HEADING = "showbagsCard-product--name"
SHOWBAG_PRICE_SPAN = "showbagsCard-product--price"
SHOWBAG_VALUE_DIV = "showbagsCard-description-copy--included"  # retail value is in the last paragraph inside <strong> tags

# showbag is a BeautifulSoup object with the content for a particular showbag

# grab name
name_heading = showbag.find("h3", class_=SHOWBAG_NAME_HEADING)
name = name_heading.text.strip()

# get price
price_span = showbag.find("span", class_=SHOWBAG_PRICE_SPAN)

# get list of all included items
value_div = showbag.find("div", class_=SHOWBAG_VALUE_DIV)
item_paragraphs = showbag.find_all("p")[:-2]
all_items = [el.text for el in item_paragraphs]

# get total retail value
total_value_strong = value_div.find("strong")
```

### Unavoidable regex to get price values properly

We run into a bit of a hurdle when we’re trying to get price values for both the showbag price and the total retail value.

The content from a `showbagsCard-product--price` span could look something like `"   $32 "`. How do we get the numerical value on its own as a float?

We know that a numerical price value will be made up of one or more numerical digits, and then potentially followed by a decimal point and two more numerical digits. The regex pattern that matches these requirements looks like this: `"\d+(\.\d{2})?"`.

If we use the `re` regex library in Python, a function to extract the float value of a price from a given string would look like this:

```python
PRICE_PATTERN = r"\d+(\.\d{2})?"

def extract_price(full_string):
    matched = re.search(PRICE_PATTERN, full_string)
    if matched:
        return float(matched.group())
    return None
```

### Calculate value to price ratio

Once we’ve extracted the name, price, retail value and items from a showbag, the only actual calculation we have to do is the all important value to price ratio.

Here’s what that looks like in code

```python
# total_value is total retail value
# price is price of the showbag

if not total_value or not price:
    value_to_price_ratio = 0
else:
    value_to_price_ratio = total_value / price
```

I want to avoid zero division errors so if for some reason I couldn’t properly extract `total_value` or `price`, then I just by default set the ratio value to zero.

After this calculation, we have all the data we need! We just save this as a dictionary object, and append it to the list of all showbag data.

```python
# showbags_data is the list of all showbag data
showbag_data = {
    "name": name,
    "price": price,
    "retail_value": total_value,
    "value_ratio": value_to_price_ratio,
    "items": "\n".join(all_items),
    "html": showbag,
}
showbags_data.append(showbag_data)
```

### Loop

And so once we grab the showbag data for all the showbags on a page, we repeat this for all the pages available. That’s just a loop up to the total number of pages.

The code snippets so far have been a bit all over the place, but this is what the code for `fetch_data()` function looks like after being able to extract info for every showbag on every page.

```python
SHOWBAGS_URL = "https://www.eastershow.com.au/explore/showbags/"
NUM_PAGES = 52

SHOWBAG_DIV = "showbagsCard"
SHOWBAG_NAME_HEADING = "showbagsCard-product--name"
SHOWBAG_PRICE_SPAN = "showbagsCard-product--price"
SHOWBAG_VALUE_DIV = "showbagsCard-description-copy--included"  # retail value is in the last paragraph inside <strong> tags

PRICE_PATTERN = r"\d+(\.\d{2})?"

def fetch_data():
    showbags_data = []
    unique_showbags = set()

    for n in range(1, NUM_PAGES + 1):
        page = requests.get(f"{SHOWBAGS_URL}/?page={n}")
        soup = BeautifulSoup(page.content, "html.parser")

        showbags = soup.find_all("div", class_=SHOWBAG_DIV)

        for showbag in showbags:
            # grab name
            name_heading = showbag.find("h3", class_=SHOWBAG_NAME_HEADING)
            name = name_heading.text.strip()

            # skip duplicates
            if name in unique_showbags:
                print(f"duplicate: {name}")
                continue
            unique_showbags.add(name)

            print(f"processing: {name}")

            # get price
            price_span = showbag.find("span", class_=SHOWBAG_PRICE_SPAN)
            price = extract_price(price_span.text)

            # get list of all included items
            value_div = showbag.find("div", class_=SHOWBAG_VALUE_DIV)
            item_paragraphs = showbag.find_all("p")[:-2]
            all_items = [el.text for el in item_paragraphs]
            if all_items[-1].startswith("*"):
                all_items.pop()

            # get total retail value
            total_value_strong = value_div.find("strong")
            total_value = extract_price(total_value_strong.text)

            # calculate value to price ratio
            if not total_value or not price:
                value_to_price_ratio = 0
            else:
                value_to_price_ratio = total_value / price

            showbag_data = {
                "name": name,
                "price": price,
                "retail_value": total_value,
                "value_ratio": value_to_price_ratio,
                "items": "\n".join(all_items),
                "html": showbag,
            }
            showbags_data.append(showbag_data)
```

## Step 3: sort

Now that all the data is in a single list, we want to sort the list in order by value to price ratio.

To do this, we just need to specify a sorting key. And if we use a lambda function, the code looks like this:

```python
showbags_data.sort(key=lambda x: x["value_ratio"], reverse=True)
```

I’ve also set the sort to be reversed because I want highest value ratio first, and lowest value ratio last.

## Step 4: output

So we _could_ just go `print(showbags_data)` and call it a day. But scrolling through hundreds of lines of data is no one’s idea of fun so we’ll be outputting it into a [CSV file](https://www.howtogeek.com/348960/what-is-a-csv-file-and-how-do-i-open-it/).

Every single time I need to read and write CSV files I pretty much just follow the [Real Python tutorial](https://realpython.com/python-csv/). Since the data for each showbag is already conveniently stored as a dictionary, I’ll be using the [`DictWriter()` method](https://realpython.com/python-csv/#writing-csv-file-from-a-dictionary-with-csv).

```python
def write_to_csv(showbags_data, csvfile="showbags.csv"):
		"""
    Takes in a list of dictionaries containing showbag data and outputs it to a
    CSV file
    """

    csv_output = open(csvfile, "w")
    fieldnames = ["name", "items", "retail_value", "price", "value_ratio"]
    writer = csv.DictWriter(csv_output, fieldnames=fieldnames)

    writer.writeheader()

    for showbag_row in showbags_data:
        writer.writerow(
            {
                "name": showbag_row["name"],
                "items": showbag_row["items"],
                "retail_value": showbag_row["retail_value"],
                "price": showbag_row["price"],
                "value_ratio": showbag_row["value_ratio"],
            }
        )

    csv_output.close()
```

## Step 5: the answer!

Aaaand by now you’re more than ready to see the results! The best deal you can get at the Easter Show is with….

**The Australian Women’s Weekly** showbag!

<img src="/img/easter-show-value/aww-expanded.png" alt="The Australian Women's Weekly showbag with all contents" />

For a very reasonable **$22**, you can get **$490.61** worth of stuff. And that stuff is made up of **34 individual items**.

It’s not the only bag with a >20 value to price ratio though, so check out the rest of the top ten most valuable showbags!

### 2. marie claire

<img src="/img/easter-show-value/marie-claire.png" alt="Marie Claire showbag" />

**Price:** $30, **Total retail value:** $605.62, **Value to price ratio:** 20.19

### 3. Better Homes and Gardens

<img src="/img/easter-show-value/bhg.png" alt="Better Homes and Gardens showbag" />

**Price:** $30.0, **Total retail value:** $418.64, **Value to price ratio:** 13.95

### 4. Stella Athletic (Autumn)

<img src="/img/easter-show-value/stella-autumn.png" alt="Stella Athletic (Autumn) showbag" />

**Price:** $32.0, **Total retail value:** $433.48, **Value to price ratio:** 13.55

### 5. Stella Athletic (Spring)

<img src="/img/easter-show-value/stella-spring.png" alt="Stella Athletic (Spring) showbag" />

**Price:** $35.0, **Total retail value:** $433.48, **Value to price ratio:** 12.39

### 6. Tasty

<img src="/img/easter-show-value/tasty.png" alt="Tasty showbag" />

**Price:** $32, **Total retail value:** $391.89, **Value to price ratio:** 12.25

### 7. Men’s Style

<img src="/img/easter-show-value/mens-style.png" alt="Men's Style showbag" />

**Price:** $32, **Total retail value:** $385.33, **Value to price ratio:** 12.04

### 8. Rural Aid - For Our Mates In the Bush

<img src="/img/easter-show-value/rural-aid.png" alt="Rural Aid showbag" />

**Price:** $18, **Total retail value:** $180.63, **Value to price ratio:** 10.04

### 9. Mega Showbag

<img src="/img/easter-show-value/mega.png" alt="Mega showbag" />

**Price:** $30, **Total retail value:** $297.00, **Value to price ratio:** 9.9

### 10. Women’s Health magazine

<img src="/img/easter-show-value/womens-health.png" alt="Women's Health showbag" />

**Price:** $32, **Total retail value:** $299.86, **Value to price ratio:** 9.37

## Bonus: analysis

Since we have everything in a CSV file, it’ll be easy to pull it up in Google Sheets/Excel and see if we can ask some interesting questions about the showbags.

### What’s the distribution of the value to price ratio?

We can make a histogram showing us the distribution of value to price ratio in the showbags.

<img src="/img/easter-show-value/chart-value-ratio-distribution.png" alt="Chart showing the distribution of value to price ratio" />

This graph makes it very clear that our top 10 showbags are outliers compared to the other showbags. The vast majority seem to have a value to price ratio between 1.32 and 2.63.

### What’s the _least_ worthwhile showbag to buy?

Ignoring the showbags with missing total retail values, there is a single showbag with a value to price _less than 1_.

<img src="/img/easter-show-value/csv-ratio-lowest.png" alt="CSV row with Big Smarties having value ratio of 0.9" />

So basically, if you’re in the mood for smarties, you’re better off buying them yourself instead of the **BIG Smarties** showbag.

There’s also only three showbags with a value to price ratio of exactly 1.

<img src="/img/easter-show-value/csv-ratio-one.png" alt="CSV rows with three showbags having value ratio of 1" />

Buying **Allen’s Lollies**, **Snakes Alive** and **Allen’s Bites** showbags are all exactly equivalent to buying the individual iems literally anywhere else.

Luckily, it’s only those four showbags which would offer you either a negative or no return on your investment.

### Is there a general trend between value to price ratio, and the actual price of the showbag?

<img src="/img/easter-show-value/chart-value-ratio-vs-price.png" alt="Chart showing value ratio against price" />

For most showbags, there’s a pretty uniform pattern of having a value to price ratio somewhere between 1 and 5. However, the high value showbags tend to be the showbags that are more on the expensive end anyways. You’re not going to catch a bargain on a 15 dollar showbag, but if you’re willing to pay 30 dollars for a showbag, then you will have quite a few options for getting a good deal.

### Other interesting questions I haven’t gotten around to figuring out but maybe you can!

- What’s the ratio of types of showbags available? eg. confectionery, sport teams, lifestyle, movie/TV
- … it’s too late in the night I can’t think of any others

---

So that’s it! Go forth to the 2023 Royal Sydney Easter Show knowing you have the power to maximise your returns on the all-important showbags 💪🤑

If you’re curious, all of the code is accessible on [Github](https://github.com/angenibai/showbags-value) for you to run yourself. And if you want to avoid code entirely, the sorted showbag CSV is on [Drive](https://docs.google.com/spreadsheets/d/1SP-DiNee-OPh57LAdwoXO--Mn0ces-EkhD1NfiH7yFE/edit?usp=sharing).

---

[^1]: Thanks Truc :)
