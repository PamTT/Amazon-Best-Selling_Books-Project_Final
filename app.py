import numpy as np
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify, Response, request, render_template


#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///amazon_books.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
Books = Base.classes.books


#################################################
# Flask Setup
#################################################
app = Flask(__name__)


# #################################################
# # Flask Routes
# #################################################
@app.route("/")
def welcome():
    return render_template('index.html')

@app.route("/authors")
def authors():
    return render_template('Top_authors.html')

@app.route("/relationship")
def relationship():
    return render_template('Relationship.html')

@app.route("/counts")
def counts():
    return render_template('Counts.html')

@app.route("/contact")
def contact():
    return render_template('Contacts.html')


@app.route("/all_books", methods=['GET', 'POST'])
def all_books():
    # Create our session (link) from Python to the DB
    session = Session(engine)

    result = session.query(Books).all()

    session.close()
    
    all_books = []
    for row in result:
        book_dict = {}
        book_dict["Id"] = row.Id
        book_dict["Name"] = row.Name
        book_dict["Author"] = row.Author
        book_dict["User_Rating"] = row.User_Rating
        book_dict["Reviews"] = row.Reviews
        book_dict["Price"] = row.Price
        book_dict["Year"] = row.Year
        book_dict["Genre"] = row.Genre
        all_books.append(book_dict)
    
    # GET request
    if request.method == 'GET':
        # message = {'greeting':'Hello from Flask!'}
        return jsonify(all_books)  # serialize and use JSON headers

    # POST request
    if request.method == 'POST':
        print(request.get_json())  # parse as JSON
        return 'Sucesss', 200

if __name__ == '__main__':
    app.run(debug=True)