### Reviewee-api

## About Project

- Language: Node (10.15.x)
- Dependenctmanager: npm
- Framework: Express
- Database: PostgreSql

## How to install project on local
  
    Open CLI and run following commands to set up at local:
   - **Clone the project**
        >
            git clone https://github.com/uCreateit/reviewee-api.git

   - **Set permissions**
       >
            sudo chmod -R 755 { project-path }

   - **Go to project directory**
       > 
            cd reviewee-api

   - **Copy .env.example to .env**
       > 
            cp .env.example .env
   - **Install node.js**
      > 
            To install node.js follow below url :
            https://nodejs.org/en/download/
   - **Install the dependencies**    
      >
            npm install
  


# Database installation
   - **How to install postgresql ( Ubuntu )**
     >
        sudo apt-get install postgresql postgresql-contrib
   - **Which UI being used to connect to DB**
     >
        pgadmin
   - **Create  database**
     >
         1. login to pgsql
         	 sudo psql -h localhost -U postgres    
         2. create database reviewee-api
         	 create database reviewee-api;
         

# Post Installation steps
 - **Run database migrations**
    >
        sequelize db:migrate

- **Start server**
    >
        npm start
        The API will be running on http://localhost:4000 now [may differ in case port already in use]

# API dictionary:
- **commitStatus**
   >
        Pending:     0
        Accepted:    1
        Rejected:    2
        MarkAsFixed: 3
- **repository roles**
    >
        Admin:     1
        Developer: 2
        Reviewer:  3
        Others:    4
- **project type**
    >
        Your Projects: 0
        Needs Help:    1  
- **repository permissions**
    >
        Admin:     1
        Developer: 2
        Reviewer:  3 
- **commit filter status** used as **status** parameter
    >
        'All':                        0
        'Rejected | To be reviewed':  1
        'To be reviewed':             2
        'Rejected':                   3
        'Accepted':                   4
        'Rejected by developers':     5
        'Rejected by system':         6
        'Mark as fixed':              7         

## External Services/API Reference
- **Email Service**
    >
        - PostMark
        - Create Account on Postmark (https://postmarkapp.com) and verify the sender signatures.
        - Create email templetes on Postmark
        - Set Postmark token and template IDs in environment/config variables
- **Github API**
    >
        Github API is used for getting the commits/comments/projects/code
        Reference: https://api.github.com


