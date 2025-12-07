<?php
    include_once './config/Database.php';
    include_once './config/Header.php';

    header('Content-Type: application/json');
    $res = ['error' => false];
    $action = isset($_GET['action']) ? $_GET['action'] : '';

        switch($action) {
           

        }
?>
