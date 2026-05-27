import React, { useState } from "react";
import axios from "axios";

const Output = (props) => {

  const [output, setOutput] = useState("");

  const runCode = async () => {

    try {

      setOutput("Running...");

      const res = await axios.post(
        `${window.location.origin}/run`,
        {
          code: props.code,
          id: props.id
        }
      );

      setOutput(
        res.data.stdout ||
        res.data.stderr ||
        res.data.compile_output ||
        "No Output"
      );

    } catch (error) {

      console.log(error);

      setOutput("Error running code");

    }

  };

  return (

    <div className="relative h-[35%]">

      <div className="bg-gray-700 text-gray-200 text-[18px] px-4 py-3 h-full overflow-y-auto">

        <h2 className="text-xl font-bold mb-2">
          Output
        </h2>

        <pre className="whitespace-pre-wrap">
          {output}
        </pre>

      </div>

      <div className="absolute right-5 bottom-5">

        <button
          onClick={runCode}
          className="bg-amber-100 px-5 py-2 rounded-lg hover:bg-amber-200 cursor-pointer font-semibold tracking-wide"
        >
          Compile and Run
        </button>

      </div>

    </div>

  );

};

export default Output;