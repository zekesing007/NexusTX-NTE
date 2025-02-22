import dotenv from "dotenv";
import { ethers } from "ethers";
import readline from "readline";
import cfonts from "cfonts";
import chalk from "chalk";

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function transferNEX(to, amount = "0.1") {
    try {

            
        console.log("\n==============================");
        console.log("      🚀 NEX Transfer 🚀      ");
        console.log("==============================\n");

        // Load provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        console.log("🔹 Wallet loaded successfully.");

        // Convert amount to the correct decimal (assuming 18 decimals for NEX)
        const value = ethers.parseUnits(amount, 18);
        console.log(`🔹 Preparing to send: ${amount} NEX to ${to}`);

        // Fetch fee data
        const feeData = await provider.getFeeData();
        const maxFeePerGas = feeData.maxFeePerGas || feeData.gasPrice;
        const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || ethers.parseUnits("2", "gwei");
        console.log("🔹 Gas fee data retrieved.");

        // Create native transfer transaction
        const tx = {
            to: to, // Recipient address
            value: value, // Amount of NEX to send
            gasLimit: 21000, // Standard gas limit for native transfers
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            chainId: parseInt(process.env.CHAIN_ID),
            type: 2, // EIP-1559 transaction
        };

        console.log("🔹 Signing and sending transaction...");
        // Sign and send transaction
        const txResponse = await wallet.sendTransaction(tx);
        console.log(`✅ Transaction sent! Hash: ${txResponse.hash}\n`);

        // Wait for confirmation
        console.log("⏳ Waiting for transaction confirmation...");
        const receipt = await txResponse.wait();
        console.log("✅ Transaction confirmed!");
        console.log(`🔹 Block Number: ${receipt.blockNumber}`);
        console.log(`🔹 Gas Used: ${receipt.gasUsed.toString()} units`);
        console.log("\n==============================");
        console.log("      ✅ Transfer Complete ✅  ");
        console.log("==============================\n");
    } catch (error) {
        console.error("❌ Error sending transaction:", error);
    }
}

function askForInput() {
    cfonts.say("NT Exhaust", {
        font: "block",
        align: "center",
        colors: ["cyan", "magenta"],
        background: "black",
        letterSpacing: 1,
        lineHeight: 1,
        space: true,
        maxLength: "0",
    });

    console.log(chalk.blue.bold("=== Telegram Channel : NT Exhaust (@NTExhaust) ===", "\x1b[36m"));

    rl.question("Enter recipient addresses (comma-separated): ", (addresses) => {
        const recipients = addresses.split(",").map(addr => addr.trim());
        rl.question("Enter amount of NEX to send: ", (amount) => {
            rl.question("Enter the number of times to repeat transfers: ", async (loopCount) => {
                loopCount = parseInt(loopCount);
                console.log(`\nStarting transfers to ${recipients.length} addresses, repeating ${loopCount} times...`);
                for (let j = 0; j < loopCount; j++) {
                    console.log(`\n🔄 Loop ${j + 1}/${loopCount}`);
                    for (let i = 0; i < recipients.length; i++) {
                        console.log(`\n➡️ Sending ${amount} NEX to ${recipients[i]} (Transaction ${i + 1}/${recipients.length})`);
                        await transferNEX(recipients[i], amount);
                    }
                }
                console.log("✅ All transactions completed!");
                rl.close();
            });
        });
    });
}

askForInput();
