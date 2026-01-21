document.querySelector("button").addEventListener("click", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const feedback = document.getElementById("feedback").value;
    const emailRegex = /^[a-z0-9](?!.*\.\.)[a-z0-9._]*[a-z0-9]@(?=[a-z0-9-]*[a-z])[a-z0-9-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email)) {
        alert("Invalid email format");
        return;
    }
    if (name === "" || email === "" || feedback === "") {
        alert("Please fill all required fields");
        return;
    }

    const googleFormURL =
        "https://docs.google.com/forms/d/e/1FAIpQLSeTBeDquO4q5icB2HBXkhrfcorajOdtJC4PWDKgxIl9EgYwvg/formResponse";

    const formData = new FormData();
    formData.append("entry.606069155", name);
    formData.append("entry.1449862977", email);
    formData.append("entry.454053879", feedback);

    fetch(googleFormURL, {
        method: "POST",
        body: formData,
        mode: "no-cors"
    });

    alert("Feedback submitted successfully");

    document.getElementById("userdetails").reset();
});
