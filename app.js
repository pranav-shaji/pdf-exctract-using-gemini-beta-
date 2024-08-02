const express = require("express");
const app = express();
const port = 3000;
dbconnect = require("./dbconfig");
dbconnect();
require("dotenv").config();

const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const PDFExtract = require("pdf.js-extract").PDFExtract;
const path = require("path");
const { match } = require("assert");
const skill = require("./models/filterByPromptSchema");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello from pdf module");
});

// app.get("/extract-pdf", async (req, res) => {
//   const pdfFilePath = path.join(__dirname, "PRANAV SHAJI.pdf");
//   const pdfExtract = new PDFExtract();
//   const options = {}; // Customize options if needed

//   try {
//     const data = await pdfExtract.extract(pdfFilePath, options);
//     let outputData = "";

//     if (data.pages && data.pages.length > 0) {
//       const firstPage = data.pages[0];
//       outputData = firstPage.content.map((item) => item.str).join(" ");
//     }

//     if (outputData) {
//       const prompt = `${outputData} 
//           filter the candidates name and his technical skills and give the output. Put those into a js object.
//        it should be like this "{name:'candidate_name,skills:[list_of_skills]'}". The skills must be an array inside object.
//        ;
// `;

//       const result = await model.generateContent(prompt);
//       const resp = result.response;
//       const text = resp.text();

//       console.log(text,"44444444444");

//       // Define the extractSkills arrow function
//       const extractSkills = (text) => {
//         const match = text.match(
//           /```javascript\s*const skills = \[([\s\S]*?)\];\s*```/
//         );
//         console.log(match);
//         if (match) {
//           const skillsSnippet = match[1].trim();
//           return eval(`[${skillsSnippet}]`);
//         } else {
//           throw new Error("Failed to extract skills array");
          
//         }
//       };

//       let skillsArray = extractSkills(text);
//       console.log(skillsArray);

//       let newArray = skillsArray.shift();

//       if (skillsArray) {
//         await skill.create({ name: skillsArray[0], skills: newArray });

//         res.status(200).json({
//           message: "Skills saved successfully",
//           skills: skillsArray,
//         });
//       }
//     } else {
//       res.status(404).json({ error: "No data found" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Error extracting PDF", details: err });
//   }
// });


app.get("/extract-pdf", async (req, res) => {
  const pdfFilePath = path.join(__dirname, "vijayram.pdf");
  const pdfExtract = new PDFExtract();
  const options = {}; // Customize options if needed

  try {
    const data = await pdfExtract.extract(pdfFilePath, options);
    let outputData = "";

    if (data.pages && data.pages.length > 0) {
      const firstPage = data.pages[0];
      outputData = firstPage.content.map((item) => item.str).join(" ");
    }

    if (outputData) {
      const prompt = `${outputData} 
          filter the candidates name and his technical skills and give the output. Put those into a js object.
       it should be like this "{name:'candidate_name,skills:[list_of_skills]'}". The skills must be an array inside object.always give the first aswer,do not refresh the answer
       ;
`;

      const result = await model.generateContent(prompt);
      const resp = result.response;
      const text = await resp.text();

      console.log(text, "44444444444");

      // Define the extractSkills arrow function
      const extractSkills = (text) => {
        const match = text.match(/({[\s\S]*})/);
        if (match) {
          const jsonString = match[1];
          const jsonObject = JSON.parse(jsonString);
          return jsonObject;
        } else {
          throw new Error("Failed to extract JSON object");
        }
      };

      let { name, skills } = extractSkills(text);
      console.log(name, skills);

      if (skills) {
        await skill.create({ name, skills });

        res.status(200).json({
          message: "Skills saved successfully",
          name: name,
          skills: skills,
        });
      } else {
        res.status(404).json({ error: "No skills found in response" });
      }
    } else {
      res.status(404).json({ error: "No data found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error extracting PDF", details: err });
  }
});

app.post("/ask", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).send({ message: "no prompt entered" });
  }

  try {
    const result = await model.generateContent(prompt);
    const resp = result.response;
    const text = resp.text();

    res.status(200).json(text);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "failed to communicate with gemini" });
  }
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
