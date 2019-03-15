
SIMPLE VERSION

@robocoup (in room or DM?) setcommprefs "I work from 10am-6pm and answer my emails in 24 hours. I hate slack DMs." 

    // stores the string in quotes along with the username

@robocoup getcommprefs amal

    // returns the string associated with that username

@robocoup getcommprefs (no argument/username)

    // returns a list of all usernames with data & their strings ("all Bocoup communication preferences")



SLICK VERSION

@robocoup setcommprefs 

    --> replies (in room or by DM?): 

    ***Setting communication preferences***

    Question 1/5:  What are your typical work hours?

    // stores reply as "hours"

    Question 2/5:  Are there exceptions to your work hours, such as a day you regularly work different hours?

    // if "y" or "yes", give question 3; otherwise skip to question 4

    Question 3/5:  What are those exceptions?

    // --> store reply as string "except"

    Question 4/5:  What are the least disruptive (easiest, best) ways to reach you during work hours?

    // --> store reply as string "easy"

    Question 5/5:  If something is more urgent and requires your attention today, what is the best way to let you know?

    // --> store reply as string "fast"

    ***Thank you for setting your communication preferences!  To see anyone's current preferences, please type @robocoup getcommprefs [@theirname]***



@robocoup getcommprefs @somevalidname

    --> replies with the following block of text, populated with the strings recorded from setcommprefs  

    SomeValidName's Availability and Communication Preferences
    Work Hours: $hours
    Exceptions: $except
    Best ways to contact: $easy
    Best ways to contact if it's urgent: $fast




@robocoup getcommprefs [no argument]

    --> replies with the same block as above _for each Bocouper_, in a(n alphabetical?) list



@robocoup setpronouns

    --> replies:

    "Thank you for setting up your pronoun preferences!  Please type your preferred pronouns.  Feel free to also include a short explanation if desired (up to XXX characters)."

    // stores results as "pronouns" along with the username



@robocoup getpronouns @username (or without a username to see a list of all of them, as with commprefs)

    --> replies: 

    @username prefers "$pronouns"



