import { useParams } from "react-router-dom";

function ConcertDetails() {

  const { id } = useParams();

  return (
    <div style={{ padding: "40px" }}>
      <h1>Concert Details</h1>
      <p>Concert ID: {id}</p>
    </div>
  );

}

export default ConcertDetails;