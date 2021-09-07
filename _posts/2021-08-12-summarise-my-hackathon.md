---
# Required front matter
layout: post # Posts should use the post layout
title: Summarise My Hackathon # Post title
date: 2021-08-12 # Publish date in YYYY-MM-DD format

# Recommended front matter
tags: [hackathon, web-dev] # A list of tags
splash_img_source: /assets/img/summarise-my-lecture/summarise-my-lecture-intro.jpg # Splash image source, high resolution images with an aspect ratio close to 4:3 recommended
splash_img_caption: # Splash image caption

# Optional front matter
updated: # Updated date in YYYY-MM-DD format
author: 
  name: Angeni Bai and Ada Luong (ft. Edwina Adisusila)  # Author name, if not provided defaults to site.author.name
  homepage: # Author link, if not provided defaults to site.author.homepage
pin: false # true if this post must be pinned on top of the page, default is false.
listed: true # false if this post must NOT be included on the posts page, sitemap, and any of the tag pages, default is true
index: true # When false, <meta name="robots" content="noindex"> is added to the page, default is true
---
*Uni assignments. YouTube detours. Vote counting drama.*

It's an interesting, twisted, and bumpy road from a "what if I could get everything important from a lecture without actually watching it?" thought to a working web app that wins People's Choice and 4th (!) place at the 2021 CSESoc Annual Hackathon. And if living through the 24 hours of stress and adrenaline wasn't enough, we decided to relive it all to recount it here. To be fair, it's not really that summarised, but we can promise it's a good time :)

## Step 0: Acquire an idea

### 11:20 AM

**Genie:** Opening ceremony! We've signed up for the CSESoc Annual Hackathon as a group of 5 but I'm the only one in this Zoom call :') There are some formalities and rules being announced, but the important part is that I find out that the theme is **EDUCATION**! Frankly, I have very few ideas at this point, but I'm glad that at least it's a relatable topic - especially with two assignments looming this weekend...

I pass along this information to The Group Chat™️.

### 11:50 AM

**Ada**: I check The Group Chat™️ for the theme. So much potential and scope and ooh wow am I EXCITED. I take off for a walk around the block and start brainstorming ideas.

<img src="/assets/img/summarise-my-lecture/sml-0.png" alt="Text message from Ada saying she is keen to ignore work (minus the fuzzer)" style="max-width: 600px" />

**Genie:** Context: Ada and I are in the same assignment group that needs to write a fuzzer (aka a program to automate hacking other programs) and submit it by Sunday 6pm. The rest of the group do not know we are participating in a hackathon due on Sunday 1pm :D

### 12:14 PM

**Ada:** *\* checks for existing miscellaneous ideas in my archive \**

<img src="/assets/img/summarise-my-lecture/sml-1.png" alt="Ada's idea: sending shakespearean scripts one word at a time" style="max-width: 300px" />

the brainstorming is going well.

### 1:30 PM

**Ada**: We said we'd call to pull all our ideas together at around 12:30pm, but alas, time flies. I start the Hackathon call.

**Genie:** When I join the call, Ada is out on a walk. Naturally, I immediately decide that I want to go on a walk as well. So we're both walking around, bouncing ideas off each other. The thought process goes something like:

<img src="/assets/img/summarise-my-lecture/sml-2.png" alt="Scribbled ideas including better Zoom breakout rooms, rate my courses website, helping educators share resources, and lecture chat management" />

**Ada**: a lecture chat managing platform sounds pretty cool! but it's also quite broad, and we only had 24 hours to implement our base idea (and simultaneously complete our uni assignments)

<img src="/assets/img/summarise-my-lecture/sml-3.png" alt="Message from Ada: 'i reckon best thing is to keep our base idea simple but tackle something tangible and specific'" style="max-width: 600px" />

so surely, we choose a specific feature to implement and spin that off into its own product.

**Genie:** Now I was thinking about what it's like as a student watching lectures, and what would be the one thing that would really boost my experience. Well... it would be *not having to watch the lectures* :) Reading the slides is ok, but I'd be missing out on any extra info that the lecturer brings up when they answer student questions - so what if those student questions and lecturer answers were somehow matched up together and collected for each lecture??

<img src="/assets/img/summarise-my-lecture/sml-4.png" alt="Idea narrowed down to 'Lecture Q&A matching thing'" style="max-width: 370px" />

We're pretty excited because this seems to tick off our criteria!

☑️ Tackles something tangible and specific

☑️ Easy to break down into achievable stages

☑️ Something we want to use

**Ada**: I think the idea is pretty cool. Genie thinks the idea is pretty cool. But the thing is, we both came up with the idea... so the next step would be to figure out if other people would also think the idea is 'pretty cool'. Asking our friends would be a solid next step, but I also want to ask someone from the outside. So, I settle back into my desk and check out the times available for the industry mentoring meetings scattered throughout the Hackathon. The only booking left for the day was in about 10 minutes ...

<img src="/assets/img/summarise-my-lecture/sml-5.png" alt="Booking confirmation for mentoring" style="max-width: 600px" />

**Genie:** When I was happily strolling around my neighbourhood I really was not expecting that I would have a DEADLINE to return home by. And so I hang up on the call and hustle back home.

### 2:19 PM

**Ada:** The simplest thing I could do in the meantime is to probably find a way to get the transcript of a YouTube video and the live lecture chat. The official YouTube API deals with tokens and all that jazzz, but I just want to get something simple working that we can demo.

After some quick searching, I find a Python library that extracts the live chat from a YouTube video given a video token (including the user who typed the message and the timestamp of that message), and another Python library that extracts the transcript of a YouTube video from its closed captions (with associated timestamps).

<img src="/assets/img/summarise-my-lecture/sml-6.png" alt="Message showing downloaded Youtube chat" />

**Genie:** So in the time it took for me to get home, Ada has figured out that our idea *is* very possible. This is a very good start!!

<img src="/assets/img/summarise-my-lecture/sml-7.png" alt="Message showing downloaded Youtube transcript" />

### 2:34 PM

**Ada**: The hackathon's organising team decided to test the script to set up mentor meetings in production. Sadly (and unsurprisingly), CSESoc hit the maximum limit for Zoom links they could auto-generate and sent out broken emails... so all we can do is wait for an update :')

### 2:45 PM

<img src="/assets/img/summarise-my-lecture/sml-8.png" alt="Message showing mentoring starting" />

<p style="text-align: center; font-weight: 600;">
==== QUESTIONS FROM OUR MENTOR (thank you Livia from Canva!) ====
</p>

- What is the product? Will it be a Chrome extension? A web app? Something else?
- Who will pay for your product? How are you going to fund it or profit off it? Who is your product for?
- What is the problem statement? Distil the problem you're solving into one sentence.
- Who are your competitors? How is your product different to the Q&A section in Microsoft Teams or Google Meets or Zoom?
<p style="text-align: center; font-weight: 600;">
===========================================================
</p>

**Genie:** From the mentoring session, we realise we have a lot of things we need to think a bit harder about, but Liv seemed to think the idea was good at least! I am definitely even more excited about this lecture Q&A matching thing after this positive affirmation.

But for now, I am very aware that the deadlines for the fuzzer assignment (Sunday 6pm) and a COMP2511^ assignment (Monday 10am) were looming. We decide to be responsible uni students and work on actual uni stuff for the afternoon and agree to come back and start implementing our idea at 7pm.

^Object Oriented Programming - aka make a game in Java in 2 weeks

Before we go though, we make a few milestones for ourselves, so we know where to pick up:

⬜️ Get transcript + live chat

⬜️ Matches question and answer

⬜️ Have a web page - look like a YouTube to mp4 converter

⬜️ Optimising question and answer matching

⬜️ Deploy the server - flask server + react app

⬜️ Being able to save some of them (instead of generating each time)

⬜️ ...

⬜️ Video Pitch

## Step 1: Get started

### 6:28 PM

<img src="/assets/img/summarise-my-lecture/sml-9.png" alt="Ada and Genie decide to postpone working on the hackathon because we got other stuff to finish" />

### 7:30 PM

**Genie:** I am well and truly sick of making gold despawn correctly in Loop Mania^ so I decide it would be more fun to set up a basic server and connect it to a basic frontend.

I've also never connected a backend and frontend in my life before, but I had set up a Python/Flask server in COMP1531 and made a whole bunch of client-side websites in COMP6080. So how hard can it be...

^The cursed game that is the COMP2511 group assignment

### 8:00 PM

**Genie**: About 30 minutes into me relearning what a RESTful API was, my high school friends spontaneously start up a Zoom call.

<img src="/assets/img/summarise-my-lecture/sml-10.png" alt="Genie's friends text in the group chat to start a Zoom call" style="max-width: 600px" />

**Genie:** Of course I joined.

### 8:23 PM

<img src="/assets/img/summarise-my-lecture/sml-12.png" alt="Genie tells Ada she's about to start setting up a server" style="max-width: 600px" />

**Genie:** Gotta admit this message was a bit of a lie since I was already about an hour into it. But idk I didn't want to be like "hey ada i just been attempting to set up the most basic server for an hour and it's not really working yet bc i'm simultaneously listening to my friend's relationship issues".

### 9:18 PM

Meanwhile, in our COMP6447 fuzzer assignment group chat....

<img src="/assets/img/summarise-my-lecture/sml-13.png" alt="hexDoor asks 'is anyone working on this at all?'" />
<img src="/assets/img/summarise-my-lecture/sml-14.png" alt="hexDoor starts a call" />

\* Ada joins the call \*

\* Genie does not \*

<img src="/assets/img/summarise-my-lecture/sml-15.png" alt="this is fine" />

### 10:47 PM

<img src="/assets/img/summarise-my-lecture/sml-16.png" alt="Genie shows Ada the set up website" />

**Genie:** Progress! Basically, someone can input a YouTube link, and then the transcript from that video is displayed on the screen.

I show this to my friends on the call and they are.... unimpressed. Fair enough - it kinda looks like I just copied some text into plain HTML. But there's some extra stuff happening behind the scenes I promise:

<img src="/assets/img/summarise-my-lecture/sml-17.png" alt="Diagram showing the pipeline from the frontend receiving the input, sending the video id to the server, the python methods being called, and sent back to the frontend" />

Setting it all up went something like this:

1. Figure out what frameworks/languages to use - Ada had already started off with Python to do the Youtube API calls so I figure it'd be easiest to do the server in Python as well. I'd also just done an entire course making websites in React so I figure doing the frontend in React would mean less staring at documentation and Stack Overflow. We probably could've done the whole thing in React and not needed a server but:
    1. Ada had never used Javascript before
    2. With a separate backend and frontend, it'd be easier to split up work
    3. I kind of just wanted an excuse to try setting up both a backend and a frontend to see if I could do it
2. [Follow a tutorial](https://blog.miguelgrinberg.com/post/how-to-create-a-react--flask-project)
3. Add the search and result pages to the website by following [another tutorial](https://www.digitalocean.com/community/tutorials/how-to-handle-routing-in-react-apps-with-react-router)
4. Import [React-Bootstrap](https://react-bootstrap.github.io/components/forms/) to get some nice looking input fields and buttons with minimal effort
5. Extract video IDs from Youtube links by taking [a regex pattern from Stack Overflow](https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url)
6. Make the form submission trigger a request to the Flask server by, you guessed it, following [another tutorial](https://sebhastian.com/react-submit-form/)

Call me a [professional googler](/assets/img/summarise-my-lecture/sml-18.png) 😎

MVP might be a stretch, but from here all we need to do is implement the actual question-answer matching logic in Python, and make it look prettier on the frontend. Ez.

For now, though, I had neglected my COMP6447 group for the last hour so it was time for me to join *that* call and be useful.

### 11:16 PM

**Genie:** Yeah, about 16 minutes into the assignment call I realise that my brain is nowhere near security land.

<img src="/assets/img/summarise-my-lecture/sml-19.png" alt="Genie says 'bro surely we sack and work on this instead'" />

**Ada**: So... Genie and I confess to our group members that we're simultaneously attempting a hackathon and that we would be baCK to work on the fuzzer in the morning 😇

## Step 2: Actually implement

### Sunday 12:00 AM

**Ada**: My brain is sort of fried from the fuzzer assignment, but the night is still young and I promised Genie that I would stay and work on the hackathon project for another hour. 

It's time to get serious and think about how we're going to implement the core functionality of our product: matching questions from the live lecture chats with answers from the lecturer in the recording. 

<u>Firstly, How can you tell when a lecturer has answered something in the chat?</u>

I search for Marc Chee's COMP1511 (Programming Fundamentals) lectures — they're interactive, conveniently public on YouTube, and the live lecture chats are saved. By skipping through a few of his lectures and thinking about my own observations from lectures, I notice that lecturers tend to do one of a few things when answering questions from the chat:

1. Mention that they're going to take a look at "the chat" or that "{user} has asked a question"
2. Repeat the question in the chat and then answer it
3. Integrate the chat questions in their explanations without acknowledging the chat at all  
4. Ignore the chat and let a moderator deal with the questions

So, the next question then is: 

<u>How can you match the question in the chat with the answer from the course staff?</u>

> **EXHIBIT A: HACKATHON NOTES**
>
>  Ideas: 
>  * APIs to determine whether something is a question
>  * Moderators tagging users when answering questions in chat
>  * Lecturers repeating questions / "blah blah has asked a question"
>
>  Optimise:
>  * Checking timestamps
>  * Detect if question not repeated exactly - similarities between text/word frequency

Answers from moderators usually involve the moderators tagging the person who asked the question in the chat or come soon after the question is asked. This means we could probably get Q&A summaries from the lecture chat alone. But that wasn't the focus of our product, we're curious to see if we could match questions from the chat with answers from the *lecture recordings*.

One simple way we could match the chat with the transcript would be to first identify where the lecturer repeats or mentions a question in the chat, and then extract the next few sentences to get their answer to the question.

But the lecture live chat doesn't fall neatly into a Q&A format. It's lively and dynamic - full of offhand remarks, banter, chatter, and discussion. People don't talk with Proper Grammar. How can you tell if a comment from a student is a question? What if the lecturer doesn't repeat the question at all? And if they did, where would you start searching?🤔🤔🤔

HMMMMMMMMMMMMMMMMMMMMMMMMMM

For now, we need to get something *working -* we can optimise and iterate over it *later*.

Here's the deal: we'll first find instances in the lecture transcript where the lecturer mentions "the chat" or "questions" as our starting point. Then, we'll read in the next few phrases or sentences, hoping that the lecturer is repeating or rephrasing the question in some form. Then, we'll search through the live chat and find similar phrases. If there's a match, we'll take the next few sentences from the lecturer and assert that it's the answer to the question. Ez.

<figure>
    <img src="/assets/img/summarise-my-lecture/sml-20.png" alt="Annotated algorithm in action" />
    <figcaption><i>* frontend transported from the future *</i></figcaption>
</figure>

Then comes the next question:

<u>How can you tell if two statements are 'similar'?</u>

I spiral down an internet rabbit hole looking for a solution and end up at [an interesting competition from 2017](https://www.kaggle.com/c/quora-question-pairs/code). It was a problem put forward by Quora, a public question-and-answer website based in Mountain View, California. The website has over 100 million people every month, so many people ask similarly worded questions — this makes it hard for seekers to find the best answer to their questions and makes writers feel they need to answer multiple versions of the same question.

<img src="/assets/img/summarise-my-lecture/sml-21.png" alt="Quora Question Pairs competition" />

(Yes, $25,000 prize money!)

By taking a look at the open-source code people submitted, we find some AI models that we could repurpose for our product. Alternatively, we could train our own AI model, but we would need a lot more data, a lot more time, and a lot more experience with how to go about doing so.

**Genie:** I also discover that AI models need to be *deployed??* Considering that we aren't even up to deploying our Flask server, maybe it's time to climb out of this rabbit hole.

**Ada**: After another half hour of looking through other people's projects, we come across a [blog post](https://hub.packtpub.com/use-tensorflow-and-nlp-to-detect-duplicate-quora-questions-tutorial/) walking through how they built their NLP project and all the Python libraries they used. 

There's Numpy and pandas that are used heaps in data science projects. Then, there's some machine learning and natural language processing libraries: scikit-learn, gensim, python-Levenshtein, NLKT, and fuzzywuzzy. Fuzzywuzzy sounds so CUTE, tempting me to look into it first. 

(A couple of weeks later, I realised that the name isn't random - but rather based on the fuzzy string matching technique for matching patterns approximately, rather than exactly. Pretty cool stuff!)

**Genie:** I very much agree that [fuzzywuzzy](https://github.com/seatgeek/fuzzywuzzy) sounds very cute, so let's look into what it does. [Tutorialspoint](https://www.tutorialspoint.com/fuzzywuzzy-python-library) tells us this:

<img src="/assets/img/summarise-my-lecture/sml-22.png" alt="Introduction to the FuzzyWuzzy library" />

Compares strings!! Returns a score based on how closely they match!!! This is perfect for us!

Since our whole goal is to match a question in the chat with where that question has been repeated by the lecturer in the live transcript, all we need to do is pass strings from the chat and live transcript into fuzzywuzzy. Specifically the **ratio** function in the **fuzz** module.

The scoring part is also super convenient because we can adjust our threshold value for detecting matches between a question asked in the chat and a question repeated in the live transcript. The max score is 100 - when the two strings match exactly. Obviously, the lecturer probably won't repeat the question exactly, so we have a bit of leeway to fiddle with the threshold score.

We look for a few lectures and pass them in, adjusting the threshold score as we go. Basically, we're doing the work of the neural networks we didn't train :) The highly advanced Genie and Ada AI model lands on 48 as the magic threshold that can detect most matches, without producing false positives. 

<img src="/assets/img/summarise-my-lecture/sml-23.png" alt="Majik" style="max-width: 500px" />

### 1:45 AM

**Genie:** So far, the web design was kind of non-existent. I think I was kind of banking on the idea that someone else in the group chat \*cough Eddy\* would come along and work their frontend magic. But by 1:45am, I accept that the frontend magic will be whatever Bootstrap components I can pull together before I fall asleep ;-;

**Before:**
<img src="/assets/img/summarise-my-lecture/sml-24.png" alt="Link input screen before" />
<img src="/assets/img/summarise-my-lecture/sml-25.png" alt="Video transcript screen after" />

**After:**
<img src="/assets/img/summarise-my-lecture/sml-26.png" alt="Link input screen after" />
<img src="/assets/img/summarise-my-lecture/sml-27.png" alt="Video q&a screen after" style="max-width: 685px" />

So, uh now there's a navbar, there's a place for the Q&As to go, and there's left and right margins.

<img src="/assets/img/summarise-my-lecture/sml-11.jpeg" alt="It ain't much, but it's honest work" style="max-width: 400px" />

Also notice that at this point, our name is "Q&A Delivery Service". Real catchy right?

### 2:30 AM-ish

**Ada**: 

✔️ spend the next hour vibing with a different hackathon team that has crashed our call

✔️ simultaneously try and find recordings of live YouTube Q&A sessions from vloggers (to test our product outside of the educational context, obviously)

❌ help Genie

### Sunday 3:03AM

<img src="/assets/img/summarise-my-lecture/sml-28.png" alt="Ada sends a bill wurtz tweet: everything keeps going in and out of shambles" style="max-width: 600px" />

**Ada**: I make one (1) Canva slide and call it a night.

**Genie:** I reckon the website has reached a presentable state, so it's time for me to sleep too.

<img src="/assets/img/summarise-my-lecture/sml-29.png" alt="Genie sends one last message to the group chat" />

Although not without a last attempt to get the rest of our original group to help out :')

## Step 3: Pitch it

### 9:00 AM

**Genie:** Rise and shine[...](https://youtu.be/gxzIUB_Vbj0)

So with 4 hours to go until the submission time, and knowing that

a) our slide deck currently consists of a Canva template and a title

b) Ada probably wouldn't be awake until at least 10am (she has a track record of getting the recommended hours of sleep)

you'd think the logical thing to do would be to do some very important work on starting to plan what we would pitch. Maybe something like defining a problem statement, figuring out a business model, coming up with user stories, or even at least giving our thing a real name so we don't have to try to pitch something called a "Q&A Delivery Service".

### 10:06 AM

<img src="/assets/img/summarise-my-lecture/sml-30.png" alt="Genie tells Ada that she has 'added some tiny extra features'" style="max-width: 650px" />

**Genie:** Ok so at 10:06am we did not have a problem statement, business model, user stories, or a name. *But* we now had some "tiny extra features" in the form of:

1. a second tab on the home screen for uploading transcript files (that didn't actually upload anywhere)
2. each question returned by the summariser has a clickable timestamp that leads you to the corresponding position in the lecture!

I still want to feel that I've somehow contributed a *little* towards the pitch in this time, so I go to record a quick demo of the web app as it is now.

Except, we STILL DON'T HAVE A NAME.

Time to brainstorm. Maybe something techy? Or some type of lowkey pun? Or like a single word that somehow encapsulates everything we're doing: condensing lectures.

<img src="/assets/img/summarise-my-lecture/sml-31.png" alt="Synonyms for condense" style="max-width: 500px" />

Compress?? Curtail?? Coagulate???

Summarise doesn't sound half bad but it's a bit vague... So I guess we should specify what we're summarising? We should also make it sound like a call to action because that would probably be easy to remember.

And that's when I landed on: **"Summarise My Lecture"**

### 11:01 AM

<figure>
    <img src="/assets/img/summarise-my-lecture/sml-32.png" alt="Genie telling the group chat 'ahaha we don\'t have a video yet'" style="max-width: 650px" />
    <figcaption>19 July 2020 at 10:49am</figcaption>
</figure>

Context: this is from when we did the CSESoc Hackathon last year. We evidently have not learned our lesson.

**Genie:** Alexa play Olivia Rodrigo - deja vu

**Ada**: or that's what they want you to thinK! 👀 This year, I am READY to furiouslyeditthevideominutesbeforethedeadline.

Here's the plan:

☑️ ~~Make a plan~~

Now, all we have to do is pitch the problem and introduce our product, come up with two user stories, record the voice-over for our business model, and do a short demo of our features...

3-minute video. 1.5 hours to make it. 

How hard could it possibly be?

First, breakfast :))))) 

## Step 4: Pitch it (actually this time)

### 11:22 AM

<img src="/assets/img/summarise-my-lecture/sml-33.png" alt="Eddy telling Genie 'I\'m so sad I couldn\'t help you guys'" style="max-width: 650px" />

**Genie:** Eddy texts me as if she were expecting that we would be finished?? We were just getting STARTED.

**Eddy:** HI! This is where I briefly come in to help after Genie and Ada brought to life what I think is the coolest idea ever. I soon realise that the hackathon submission is due in an hour and all I see is a very nice Canva template.

I couldn't let all the hard work they put in not be recognised, so I put my COMP2511 assignment on hold and begin filming!

**Ada**: Now we've got an extra person :D Theoretically, if I record the introductory segment, Eddy voice-overs the user stories, Genie records the demo, and whoever finishes first does a voice-over for the business model... I could pull it all together ~~before~~ on the deadline! :DDDD

### 12:00 PM -ish

**Ada**: We spent the last 30 minutes finishing up the slides (whoops) and now we've got 30 minutes to go with the video. I try to record the introductory segment of our pitch. It'll take like a minute maximum to introduce our problem statement and pitch our solution.... when I suddenly decide that I really want to have my CAT in the video as well... because what's a university lecturer without a cat!?!?!?!? (recall: I spent my night analysing Marc Chee's COMP1511 lectures). 

<img src="/assets/img/summarise-my-lecture/sml-34.png" alt="Ada's cat!" style="max-width: 250px" />

I check Discord and Genie and Eddy have already sent over some parts of their video, but I really want to get this shot with my cat (who does not want to be in the frame) in the frame. After my 17123th attempt, I log back into discord so I can speed-edit this video

<img src="/assets/img/summarise-my-lecture/sml-35.png" alt="Eddy and Genie hyping up Ada" />

... and realised I was not on mute 😳😳😳

**Genie:** So I'm doing a voice-over for the product demo, and a video clip of me being a stressed uni student. The latter isn't too hard because I AM a stressed uni student. Also shoutout to my mum for not asking any questions when her daughter tells her that she needs to film her watching a lecture at 5.00x speed :)

As I upload the recorded files, *I can feel us running out of time*.

**Eddy**: After a few takes of me desperately trying not to laugh as I put my acting skills to the test I finally send Ada a timelapse and a voice-over hoping she doesn't have to do much editing. I gather some statistics of the potential number of students 'Summarise My Lecture' can reach and help put some slides together up until the very last minute before submission. 

**Genie:** So when I jump back in the call I see some very cool slides have appeared, courtesy of Eddy. And now she needs to get back to her COMP2511 group so it's recording pt 2 for me.

I bash out something coherent to say, speed read it and send the recording off to Ada and hope she will work her magic.

### 12:29 PM

<figure>
    <img src="/assets/img/summarise-my-lecture/sml-23.png" alt="Majik" style="max-width: 600px" />
    <figcaption>Ada working her majik (c. Sunday 12:29pm, colourised)</figcaption>
</figure>

### 1:00 PM

<div class="iframe-container">
    <iframe src="https://www.youtube.com/embed/fJBVRQbtfBo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

**Genie:** I am IMPRESSED by the pitch and very hyped because that was our 24hrs!! Smushed into a 3-minute video!! That doesn't look half bad!! The stress adrenaline is turning into happiness adrenaline :D 

**Ada**: and we were DONE!!!! pitch [SUBMITTED](https://www.youtube.com/watch?v=fJBVRQbtfBo). GitHub [LINKED](https://github.com/adaluong/summarise-my-lecture-hackathon). energy levels HIGH. I was READY for some lunch to celebrate!!!!

**Genie:** Also remember the milestones we set like 24 hours ago? How did we go with those...

☑️ ~~Get transcript + live chat~~

☑️ ~~Matches question and answer~~

☑️ ~~Have a web page - look like a YouTube to mp4 converter~~

⬜️ Optimising question and answer matching

⬜️ Deploy the server - flask server + react app

⬜️ Being able to save some of them (instead of generating each time)

⬜️ ...

☑️ ~~Video Pitch~~

4 out of 7 ain't terrible :))

***Meanwhile... in the fuzzer group chat...***
<img src="/assets/img/summarise-my-lecture/sml-37.png" alt="hexDoor asking 'can i have some kind of articulation that anyone is here?'" />

## Step 5: Sike - pitch part THREE

### 1:31 PM

<img src="/assets/img/summarise-my-lecture/sml-38.png" alt="Ada and Genie realising we need to do live Q&A" style="max-width: 350px" />

**Genie:** I swear I was listening during the welcome, but somehow missed the fact that every team had to do live Q&A after the judges watched their video??

So we gotta report back to our COMP6447 group - *sorry* we'll come back in another hour :))

<img src="/assets/img/summarise-my-lecture/sml-39.png" alt="hexDoor says 'i still dont understand why you guys did a hackathon'" />

*(editor's note: don't worry, we pulled through with this assignment with a solid 9/10 :') ... and it was only the mid-point submission... no stress...)*

### 2:00 PM

**Genie:** The hackathon groups are put in Zoom calls, where our video pitch gets played, and then we have 2 minutes to answer any questions they have for us. We wait around for a few groups to go before us, and then it's SHOWTIME.

**Ada**: I'm pretty proud of our video, but I had already seen it before 😛 so as our pitch was being played, I couldn't help but click around Zoom to see if I could gauge people's initial reactions 👀👀👀

**Genie:** They all seemed to like the cat ngl

**Ada**: me too 🥰

**Genie:** But all too soon, it's time to face the judges' questions. The first judge hits us with a tEchnical one.

> *Something something, "so you're using the Levenshtein distance, can you tell me what other algorithms you're using?"*

Ok, this guy evidently did not fall for our attempt to use big words to seem impressive.

So I tell him something like

> *"well, this is our first prototype so uh we're just using Levenshtein distance for our string matching algorithm and it works to show that this functionality is possible. we can totally develop it further though by feeding the ratio value and values from other algorithms into a machine learning model that will increase the accuracy of the matching",*

which is a really long way of saying "uh... none?".

**Ada**: Then, the second judge jumps in:

> *"What's next? Any plans to expand? Can you see this as maybe a Google Chrome Extension..."*

And we INDEED did think about this!! So I tell them

> *"Yeah! We were debating what our minimum viable product should be - so we were debating between a Chrome Extension or a web app... and went with the web app. But we would definitely consider our next step being a lightweight Chrome Extension which could generate a summary PDF of some sort..."*

As I'm speaking, more ideas come to me so I keep going:

> *"We also plan to add more features to the web app, like implementing persistence of some sort. Especially with lectures being online, we're considering having persistence between course iterations and having a feature that automatically generates frequently asked questions"*  

**Genie:** Yep I'm definitely hearing this for the very first time. But I reckon it's a very good idea! So surely that's a good sign that the judges will agree :D

## Step 6: Reflect

### 2:23 PM

<img src="/assets/img/summarise-my-lecture/sml-40.png" alt="Ada: 'fuck yeah' Genie: 'yo wtf that went kinda well'" />

### 5:00 PM

**Ada**: it's now time for the closing award ceremony! our fuzzer assignment is FINISHED and about to be submitted and the results from the Hackathon judges are IN. and now... we wait... 

**Genie**:

**Ada**: 

<img src="/assets/img/summarise-my-lecture/sml-41.png" alt="Didn't get a place but still pretty excited" />

**Genie:** ok damn ngl I *was* hoping we could slide into 3rd or something but alas we did not get announced as any of the winners. But either way, I was still buzzing from managing to pull everything into a little video and get everything submitted. Our judges did seem to have liked our pitch though....

**Ada**: I didn't get a chance to watch all the group's pitches, but I'm pretty keen to see what everyone else did. We somehow made it to the finals in 2020 as a bunch of first years, but since everyone got a chance to pitch live to the judges this year, there was no way to tell if we were close 👀. I'm still pretty curious about how we went. Surely, we ask for feedback 👀👀👀

## Step 7: Plot Twist??

### 5:41 PM

<img src="/assets/img/summarise-my-lecture/sml-42.png" alt="Us realising we came 4th and 2nd for People's Choice" style="max-width: 600px" />

**Genie:** We were very close !! It's so close that I ask Ryan (CSESoc Media Co-Director) to double-check the scores.

And he makes an important observation...

<img src="/assets/img/summarise-my-lecture/sml-43.png" alt="Ryan realises we actually tied for People's Choice" style="max-width: 600px" />

**Ada**: 👀👀👀👀👀👀👀👀👀👀👀👀👀👀👀👀👀👀👀👀👀👀👀

<img src="/assets/img/summarise-my-lecture/sml-44.png" alt="Genie tells Shrey about the votes" style="max-width: 450px" />

**Genie:** I reckon that counts as official confirmation.

**Ada**: :00000

## ***fin***

## Epilogue

**Genie:** Well that was a ride.

There's still a part of me that's like... I can't believe we actually pulled it off? Two stressed uni students with many other things we *should* be doing, but managing to pull together a semi-functioning website and a nice-looking pitch in 24 hours. 

**Ada**: I've spent so much of this term learning how to break into programs and how to design algorithms in the abstract (admittedly, very cool courses). But finishing the hackathon reminded me of how amazing it feels to actually *build* something, especially with other people, and regardless of how insecure or shoddy the first iteration of it may be.

There's an unparalleled thrill that comes with making something with a plan we designed ourselves. Fixing what we wanted our product to look like, diving through every internet spiral to figure out how we would get there, and then wondering if the problem we're trying to solve is a problem worth solving at all.

**Genie**: Reliving the whole experience while writing this blogpost I've realised that at so many points things could've gone entirely differently. What if we'd gone with a different idea? What if I'd never decided that it was a good idea to abandon my assignments for a bit? What if we'd never gone back to working on it at 12 in the morning?

**Ada**: It's interesting putting the experience into words and into a cohesive narrative when in the moment, it felt like everything was happening all at once. 

I'm extremely glad that Genie convinced me to ditch that uni assignment and hit that delirious 3am state - when everything's funny and nothing's impossible and all you want is for whatever you're coding to *work, dammit!* When there's so little time and so much to do, we really had to focus on what the core of our product was, figure out what we needed to learn, and then go all in and fly the plane while building it (because, well there's always time after the Hackathon to iterate over it, right? 👀)

<figure>
    <img src="/assets/img/summarise-my-lecture/sml-45.png" alt="Ada and Genie flying a plane while building it" style="max-width: 500px" />
    <figcaption>Ada and Genie flying a plane while building it</figcaption>
</figure>

**Genie:** With this project, I also got the chance to do a couple of things I'd been meaning to but never got around to: setting up a website with both a frontend and a backend, and messing around with natural language processing (ok this one's a stretch, but there's room to *expand*). But I guess that's what hackathons are about - giving you a reason to learn that thing you always wanted to. Because now your teammates are depending on it!

**Ada**: So with that, thank you to everyone who made this experience possible. Thank you to  the organisers from CSESoc for volunteering their time and energy to coordinate the entire event. Thank you to the judges and industry mentors for listening to our pitches and giving us feedback. To the sponsors for such sweet prizes. To the other Hackathon-ers for their fantastic memes and vibes. And to our group project members for dealing with our temporary absence. 

**Genie**: Now, I think every semi-successful hackathon group reaches the end and goes *"hey what if we make this an actual thing?"*. And you bet we are no different. Those milestones that we made at the start of the project - they're still nagging me because I *know* they are achievable.

<img src="/assets/img/summarise-my-lecture/sml-46.png" alt="Ada's ideas" style="max-width: 500px" />

We also have a few extension ideas! Including the one Ada came up with on the spot during Q&A :D

**Ada**: So we may or may not have made a new set of milestones and are very keen to start the next iteration of Summarise My Lecture :D

**Genie:** But that's a story for another blog post 👀

<p style="text-align: center">---------</p>

In the meantime, check out [Ada's blog](https://adaluong.notion.site/adaluong/blog-9490f1a8b50247ee81a1b50ebb7d1833) too!