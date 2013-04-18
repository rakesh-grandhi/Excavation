<?php
// proxy.php
// Set Content-type so jQuery accepts output as XML
header('Content-type: application/xml');
// Location of XML content
//$url = 'http://anica.azurewebsites.net/WOList.asp?UID=&PWD=&LogIn=Log+In';
$url = $_GET['url'];
// Open the stream to access XML content as read-only with file pointer at beginning of file
//$pointer = fopen($url, 'r');
// If the file/content exists, loop through the file until end of file
//if ($pointer) {
//    while (!feof($pointer)) {
//        $line = fgets($pointer); // Get data from current line
//        echo $line; // Output date from current line
//        return $pointer;
//    }
//    fclose($pointer); // Close connection to file
//}
$xml = simplexml_load_file($url);
return $xml;
?>
