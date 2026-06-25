import { connect } from "../db"; // Adjust the path as necessary
import FormData from "../modals/form.modal"; // Adjust the path as necessary

export async function getData() {
  await connect();

  try {
    const data = await FormData.find({}); // Fetch all documents
    return { status: 200, data };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { status: 500, message: "Error fetching data" };
  }
}
