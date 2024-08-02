
app.get("/extract-pdf", async (req, res) => {
    const pdfFilePath = path.join(__dirname, "PRANAV SHAJI.pdf");
    const pdfExtract = new PDFExtract();
    const options = {}; // Customize options if needed
  
    try {
      const data = await pdfExtract.extract(pdfFilePath, options);
      const specificData = [];
  
      if (data.pages && data.pages.length > 0) {
        const firstPage = data.pages[0];
        outputData = firstPage.content.map((item) => item.str).join(" ");
      }
  
      console.log(outputData);
  
      if (outputData) {
        const prompt = `${outputData} 
        filter out his skills and give the output.put those skills into an array`;
      //   filter out skills of the person from it.Insert those strings into an js array.
      //   Give the array only.no need of any other texts
        const result = await model.generateContent(prompt);
        const resp = result.response;
        const text = resp.text();
  
  
        console.log(text);
        //res.json({ extractedData: text });
        if (text) {
          const extractSkills = (text) => {
            const match = text.match(/```javascript\s*const skills = \[([\s\S]*?)\];\s*```/);
            if (match) {
              const skillsSnippet = match[1].trim();
              return eval(`[${skillsSnippet}]`);
            } else {
              throw new Error("Failed to extract skills array");
            }
          };
        }
        
        console.log(skillsSnippet);
        res.status(200).send({messsage:extractSkills})
      } else {
        res.status(404).json({ error: "No data found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error extracting PDF", details: err });
    }
  });