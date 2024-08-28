import os
from flask import Flask, request, send_file, make_response, jsonify
from requests_toolbelt import MultipartEncoder
import json
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
from browser import clean_accesibility_tree, fetch_browser_info, fetch_page_accessibility_tree, get_web_element_rect, parse_accessibility_tree
from strings import SYSTEM_PROMPT, SYSTEM_PROMPT_TREE, WEBHOOK_URL
import base64
import requests
from flask_cors import CORS

class App:
    def __init__(self, name):
        self.app = Flask(name)
        self.sites = {
            'Allrecipes': 'https://www.allrecipes.com/',
            'Amazon': 'https://amazon.com/',
            'Apple': 'https://www.apple.com/',
            'ArXiv': 'https://arxiv.org/',
            'BBC News': 'https://www.bbc.com/news',
            'Booking': 'https://www.booking.com/',
            'Cambridge Dictionary': 'https://dictionary.cambridge.org/',
            'Coursera': 'https://www.coursera.org/',
            'ESPN': 'https://www.espn.com/',
            'GitHub': 'https://github.com/',
            'Google Flights': 'https://www.google.com/travel/flights',
            'Google Map': 'https://www.google.com/maps',
            'Google Search': 'https://www.google.com/',
            'Huggingface': 'https://huggingface.co/',
            'Wolfram Alpha': 'https://www.wolframalpha.com/'
        }
        CORS(self.app)
        self.steps = 0
        self.lmm_responses = []
        self.setup_routes()

    
    def setup_routes(self):
        @self.app.route('/initial_step', methods=['GET'])
        def initial_step():
            try:
                self.driver.quit()
                pass
            except:
                pass
            self.prompt = request.args.get('prompt')
            self.website = request.args.get('website')
            print(f"{self.prompt = }")
            print(f"{self.website = }")
            if not os.path.exists('tests'):
                os.mkdir('tests')
            i = 0
            self.folder_name = self.prompt.replace("'", "").replace(".", "")
            while os.path.exists(f"tests/{self.folder_name}-{i}"):
                i += 1
            self.folder_name = f"tests/{self.folder_name}-{i}"
            os.mkdir(self.folder_name)
            self.prompt_data = {
                'prompt': self.prompt,
                'steps': []
            }
            with open(f"{self.folder_name}/prompt.json", "w") as json_file:
                json.dump(self.prompt_data, json_file)
            chrome_options = Options()
            chrome_options.add_argument("--window-size=1024,768")
            chrome_options.add_argument("--lang=en")
            chrome_options.add_argument("user-data-dir=C:/Users/Bilal/AppData/Local/Google/Chrome/User Data")
            chrome_options.add_argument("profile-directory=Profile 1")
            self.driver = webdriver.Chrome(options=chrome_options)
            if self.website != "":
                self.driver.get(self.website)
                self.prompt_data['steps'].append(
                    {
                        'Thought': f"Website provided by the user. Launching the browser with this url: {self.website}"
                    }
                )
            else:
                website_get()
                self.driver.get(self.website)
                self.prompt_data['steps'].append(
                    {
                        'Thought': f"Website determined by the surfer. Launching the browser with this url: {self.website}"
                    }
                )
            with open(f"{self.folder_name}/prompt.json", "w") as json_file:
                json.dump(self.prompt_data, json_file)
            return jsonify(self.prompt_data)

        def website_get():
            response = requests.get(f'https://automation.promptify.com/webhook/prompt-retrieve?prompt={self.prompt}')
            if response.status_code == 200:
                print('Website determined successfully!')
                print(response.text)
                self.website = self.sites[json.loads(response.text)["site"]]
                print(f'{self.website = }')
            else:
                print('Error uploading image:', response.text)

        @self.app.route('/prompt', methods=['GET'])
        def prompt_get():
            #input("--------------PRESS KEY TO CONTINUE-------------")
            self.take_step()
            return jsonify(self.prompt_data)

        @self.app.route('/prompt_image', methods=['GET'])
        def prompt_image_get():
            self.draw_containers()
            return send_file(f"{self.folder_name}/{self.steps}.png", mimetype='image/png')


    def draw_containers(self):
        try:
            for containers in self.web_rects[0]:
                self.driver.execute_script("arguments[0].remove();", containers)
        except:
            pass
        self.driver.execute_script("window.devicePixelRatio = 1")
        browser_info = fetch_browser_info(self.driver)
        accessibility_tree = fetch_page_accessibility_tree(browser_info, self.driver, current_viewport_only=True)
        self.content, obs_nodes_info = parse_accessibility_tree(accessibility_tree)
        self.content = clean_accesibility_tree(self.content)
        self.web_rects = get_web_element_rect(self.driver)
        self.driver.save_screenshot(f'{self.folder_name}/{self.steps}.png')
    

    def take_step(self):
        self.draw_containers()
        with open(f'{self.folder_name}/{self.steps}.png', 'rb') as file:
            self.steps += 1
            self.content = self.content.replace('"', '\\"').replace("\n", "\\n").replace("\t", " ")
            self.content = self.content.replace('\\xa0', '')
            f = {
                "task": f"Task: {self.prompt}. Accessibility tree: {self.content}.", 
                'system_prompt': SYSTEM_PROMPT_TREE.replace("\n", "\\n"), 
                "image": base64.b64encode(file.read()).decode('utf-8')
            }
            #response = requests.post('https://automation.promptify.com/webhook-test/screenshot', files=f)
            response = requests.post('https://automation.promptify.com/webhook/screenshot', files=f)
        print(f"{response.status_code = }")
        if response.status_code == 200:
            print('Image uploaded successfully!')
            print(response.text)
            d = json.loads(response.text)
            d['accessibility_tree'] = self.content
            self.prompt_data['steps'].append(d)
            with open(f"{self.folder_name}/prompt.json", "w") as json_file:
                json.dump(self.prompt_data, json_file)
            self.lmm_responses.append(json.loads(response.text))
            self.execute_web()
        else:
            print('Error uploading image:', response.text)


    def execute_web(self):
        type_str, number_str, rest_str = self.parse_action(self.lmm_responses[-1]["Action"])
        if type_str == 'Type':
            self.web_rects[1][number_str].clear()
            self.web_rects[1][number_str].send_keys(rest_str)
        elif type_str == 'Click':
            self.web_rects[1][number_str].click()
        elif type_str == 'Scroll':
            if number_str == 'WINDOW':
                if rest_str == 'down':
                    self.driver.execute_script("window.scrollBy(0, 500);")
                else:
                    self.driver.execute_script("window.scrollBy(0, -500);")
        elif type_str == 'Google':
            self.driver.get('https://www.google.com/')
        elif type_str == 'ANSWER':
            self.prompt_data['Answer'] = rest_str
            with open(f"{self.folder_name}/prompt.json", "w") as json_file:
                json.dump(self.prompt_data, json_file)
            return
        #input("--------------PRESS KEY TO CONTINUE-------------")
        #self.take_step()


    def parse_action(self, action):
        type_str = ""
        number_str = ""
        rest_str = ""
        if ";" in action:
            rest_str = action.split(';')[1].replace('[', '').replace(']', '').strip()
        action = action.split(';')[0].split(' ')
        type_str = action[0].strip()
        if len(action) > 1:
            number_str = action[1]
            number_str = number_str.replace('[', '').replace(']', '').strip()
            if number_str.isdigit():
                number_str = int(number_str)
        return type_str, number_str, rest_str



    def run(self, debug=True):
        self.app.run(debug=debug)




if __name__ == '__main__':
    app = App(__name__)
    app.run()