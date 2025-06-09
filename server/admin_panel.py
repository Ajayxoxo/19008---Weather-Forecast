import tkinter as tk
from tkinter import messagebox
from pymongo import MongoClient
from bson import ObjectId
import os

# MongoDB Configuration
MONGO_URI = "mongodb+srv://weat:y1Gz3lap4IkOPdC9@backenddb.enp5odq.mongodb.net/kalimark?retryWrites=true&w=majority&appName=BackendDB"
client = MongoClient(MONGO_URI)
db = client.get_default_database()
collection = db['Mumbai']

# ObjectId map for each city
CITY_OBJECT_IDS = {
    "Mumbai": ObjectId("6837ff95bf6154d3bd28d0ea"),
    "Kochi": ObjectId("6836e4a87fa8828099ec3407"),
    "Bangalore": ObjectId("6837ffa1bf6154d3bd28d0eb")
}

# URLs for Section 2
SECTION2_URLS = {
    "Red": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/s3/red.mp4",
    "No": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/s3/no.mp4",
    "Orange": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/s3/orange.mp4",
    "Yellow": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/yellow.mp4"
}

# URLs for Section 3 (internal keys remain same)
SECTION3_URLS = {
    "Rainy": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/s3/rainy.mp4",
    "Cloudy": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/s3/cloudy.mp4",
    "Sunny": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/sunny.mp4",
    "Floody": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/s3/floody.mp4"
}

# Labels shown in UI for Section 3, mapped to internal keys
SECTION3_LABELS = {
    "Moderately Heavy": "Rainy",
    "Average": "Cloudy",
    "No Rain": "Sunny",
    "Extremely Heavy": "Floody"
}

# URLs for Section 4
SECTION4_URLS = {
    "1": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/s3/1.mp4",
    "2": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/s3/2.mp4",
    "3": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/s3/3.mp4",
    "4": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/s3/4.mp4"
}

# Initialize main window
tk_root = tk.Tk()
tk_root.title("Admin Panel")

selected_city = tk.StringVar(value="Mumbai")
section2_selection = tk.StringVar()
section3_selection = tk.StringVar()
section4_selection = tk.StringVar()
section2_enabled = tk.BooleanVar()
section3_enabled = tk.BooleanVar()
section4_enabled = tk.BooleanVar()

# City dropdown
tk.Label(tk_root, text="Select City:").pack()
tk.OptionMenu(tk_root, selected_city, *CITY_OBJECT_IDS.keys()).pack()

# Function to create each section UI (supports optional label_map)
def make_section(label_text, options, selection_var, enabled_var, label_map=None):
    tk.Checkbutton(tk_root, text=f"Enable {label_text}", variable=enabled_var).pack(anchor='w')
    frame = tk.Frame(tk_root)
    frame.pack(anchor='w')
    tk.Label(frame, text=label_text).pack(anchor='w')
    for display_text in options:
        key = label_map[display_text] if label_map else display_text
        tk.Radiobutton(frame, text=display_text, variable=selection_var, value=key).pack(anchor='w')

# Create Section 2 (uses internal keys as labels)
#make_section("Section 2", SECTION2_URLS.keys(), section2_selection, section2_enabled)

# Create Section 3 (use friendly labels via SECTION3_LABELS)
make_section("Section 3", SECTION3_LABELS.keys(), section3_selection, section3_enabled, label_map=SECTION3_LABELS)

# Create Section 4 (uses internal keys as labels)
#make_section("Section 4", SECTION4_URLS.keys(), section4_selection, section4_enabled)

# Submit handler

def submit():
    city = selected_city.get()
    doc_id = CITY_OBJECT_IDS.get(city)
    update_data = {}

    if section2_enabled.get():
        sec2_value = section2_selection.get()
        if sec2_value:
            update_data["Section2"] = {sec2_value: SECTION2_URLS[sec2_value]}
        else:
            messagebox.showerror("Error", "Section 2 is enabled but no option is selected.")
            return

    if section3_enabled.get():
        sec3_value = section3_selection.get()  # this is the internal key like 'Rainy' etc.
        if sec3_value:
            update_data["Section3"] = {sec3_value: SECTION3_URLS[sec3_value]}
        else:
            messagebox.showerror("Error", "Section 3 is enabled but no option is selected.")
            return

    if section4_enabled.get():
        sec4_value = section4_selection.get()
        if sec4_value:
            update_data["Section4"] = {sec4_value: SECTION4_URLS[sec4_value]}
        else:
            messagebox.showerror("Error", "Section 4 is enabled but no option is selected.")
            return

    if not update_data:
        messagebox.showerror("Error", "No section is selected for update.")
        return

    # Perform MongoDB update
    collection.update_one({"_id": doc_id}, {"$set": update_data})
    messagebox.showinfo("Success", f"Updated data for {city} successfully!")

# Submit button
tk.Button(tk_root, text="Submit", command=submit).pack(pady=10)

tk_root.mainloop()
