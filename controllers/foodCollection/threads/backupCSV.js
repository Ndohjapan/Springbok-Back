const { transactionSchema } = require("../../../models/mainModel");
const dotenv = require("dotenv");


const { uploadBackup } = require("../../document");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const path = require("path");

dotenv.config({ path: "../../../config/config.env" });

exports.uploadBackup = (async(data) => {
    const year = data.year
    const month = data.month
    const day = data.day
    const restaurantName = data.restaurantName
    const restaurantId = data.restaurantId
    const folder = year+"-"+month+"-"+day
    let name = restaurantName+"-"+year+"-"+month+"-"+day+".csv"

    try {
        const csvWriter = createCsvWriter({
            path: name,
            header: [
              { id: "id", title: "id" },
              { id: "from", title: "From" },
              { id: "to", title: "To" },
              { id: "amount", title: "Amount" },
              { id: "restaurantPreviousBalance", title: "Resta. Prev. Balance" },
              { id: "restaurantCurrentBalance", title: "Resta. Curr. Balance" },
              { id: "studentPreviousBalance", title: "Std. Prev. Balance" },
              { id: "studentCurrentBalance", title: "Std. Curr. Balance" },
              { id: "createdAt", title: "Time" },
            ],
        });

        let transactions = [];
        transactions = await transactionSchema
        .find(
            { 
                createdAt: { $gte: new Date(`${year}-${month}-${day}T00:00:00.000Z`), $lte: new Date(`${year}-${month}-${day}T23:59:59.999Z`) }, 
                to: restaurantId 
            }, 
            null, 
            {
                sort: { createdAt: -1 },
            }
        )
        .populate(["from", "to"]);

        let datas = [];
        if (!transactions.length) {
            return( {
                status: 400,
                body: { success: false, message: "There are no transactions" },
            })
        }

        for (i = 0; i < transactions.length; i++) {
            let objectData = {};
      
            objectData.id = transactions[i]._id;
            objectData.from =
              transactions[i].from.firstname + " " + transactions[i].from.lastname;
            objectData.to = transactions[i].to.name;
            objectData.amount = transactions[i].amount;
            objectData.restaurantPreviousBalance =
              transactions[i].restaurantPreviousBalance;
            objectData.restaurantCurrentBalance =
              transactions[i].restaurantCurrentBalance;
            objectData.studentPreviousBalance =
              transactions[i].studentPreviousBalance;
            objectData.studentCurrentBalance = transactions[i].studentCurrentBalance;
            objectData.createdAt = transactions[i].createdAt;
      
            datas.push(objectData);
        }

        await csvWriter.writeRecords(datas);
        console.log("The CSV file was written successfully");

        return new Promise((resolve, reject) => {
            uploadBackup(name, folder).then(result => {
                resolve(result)
                deleteCSV(name)
            })
            
        })

    } catch (err) {
        console.log(err);
        return ({ status: 400, body: { success: false, message: err.message } });
    }


})

async function deleteCSV(name) {
    const uniqueFileName = path.join(__dirname, "..", "..", "..", name);
    const url = uniqueFileName;
    fs.access(url, fs.F_OK, async (err, ac) => {
      if (err) {
        return err;
      } else {
        await fs.unlink(url, (err, fc) => {
          if (err) {
            return "Error Occure On File Deletion!";
          } else {
            console.log("File deleted!");
            return "File deleted!";
          }
        });
      }
    });
}